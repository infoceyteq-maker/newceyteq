import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "@/lib/db/schema";

/**
 * One PostgreSQL dialect, two drivers:
 *
 *  • `postgres://` / `postgresql://` → node-postgres (Supabase, RDS, Neon, …)
 *  • anything else (default)         → PGlite, a WASM build of PostgreSQL that
 *                                      runs in-process with a local data folder.
 *
 * Both speak the same SQL with `$1` placeholders, so the rest of the codebase
 * never branches on the driver.
 */
export type SqlParam = string | number | boolean | null | undefined;

type Queryable = {
  query<T>(sql: string, params?: SqlParam[]): Promise<T[]>;
  /** Runs a multi-statement script (DDL). */
  exec(sql: string): Promise<void>;
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
};

const globalForDb = globalThis as unknown as {
  __ceyteqDb?: Promise<Queryable>;
};

function isRemotePostgres(url: string) {
  return /^postgres(ql)?:\/\//i.test(url);
}

function normaliseParams(params: SqlParam[] = []) {
  return params.map((value) => (value === undefined ? null : value));
}

function toInt(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

async function createPglite(): Promise<Queryable> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir =
    process.env.PGLITE_DATA_DIR || path.join(process.cwd(), ".data", "pglite");

  // PGlite expects the parent folder to exist.
  mkdirSync(dataDir, { recursive: true });

  const client = new PGlite(dataDir);

  const run = async <T>(sql: string, params: SqlParam[] = []): Promise<T[]> => {
    const result = await client.query<T>(sql, normaliseParams(params));
    return result.rows as T[];
  };

  return {
    query: run,
    exec: async (sql: string) => {
      await client.exec(sql);
    },
    transaction: async <T>(fn: (tx: Queryable) => Promise<T>) =>
      client.transaction(async (t) => {
        const tx: Queryable = {
          query: async <R>(sql: string, params: SqlParam[] = []) => {
            const result = await t.query<R>(sql, normaliseParams(params));
            return result.rows as R[];
          },
          exec: async (sql: string) => {
            await t.exec(sql);
          },
          transaction: async <R>(inner: (tx2: Queryable) => Promise<R>) => inner(tx),
        };
        return fn(tx);
      }),
  };
}

async function createNodePostgres(url: string): Promise<Queryable> {
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: url,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    // Supabase requires TLS; local unix-socket setups usually don't.
    ssl: /supabase|neon|render|amazonaws|sslmode=require/i.test(url)
      ? { rejectUnauthorized: false }
      : undefined,
  });

  return {
    query: async <T>(sql: string, params: SqlParam[] = []) => {
      const result = await pool.query(sql, normaliseParams(params) as unknown[]);
      return result.rows as T[];
    },
    exec: async (sql: string) => {
      await pool.query(sql);
    },
    transaction: async <T>(fn: (tx: Queryable) => Promise<T>) => {
      const client = await pool.connect();
      const tx: Queryable = {
        query: async <R>(sql: string, params: SqlParam[] = []) => {
          const result = await client.query(sql, normaliseParams(params) as unknown[]);
          return result.rows as R[];
        },
        exec: async (sql: string) => {
          await client.query(sql);
        },
        transaction: async <R>(inner: (tx2: Queryable) => Promise<R>) => inner(tx),
      };
      try {
        await client.query("begin");
        const value = await fn(tx);
        await client.query("commit");
        return value;
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

async function connect(): Promise<Queryable> {
  const url = process.env.DATABASE_URL?.trim() || "";

  // The embedded database writes to the local filesystem, which is ephemeral on
  // serverless platforms — never allow it to run a production deployment.
  if (process.env.NODE_ENV === "production" && !isRemotePostgres(url)) {
    throw new Error(
      "DATABASE_URL must point at PostgreSQL (e.g. the Supabase pooler) in production. " +
        "Apply db/schema.sql to that database before deploying.",
    );
  }

  const db = isRemotePostgres(url) ? await createNodePostgres(url) : await createPglite();

  // Idempotent — safe to run on every cold start.
  await db.exec(SCHEMA_SQL);
  return db;
}

function getDb(): Promise<Queryable> {
  if (!globalForDb.__ceyteqDb) {
    globalForDb.__ceyteqDb = connect().catch((error) => {
      // Allow a later request to retry instead of caching a rejected promise.
      globalForDb.__ceyteqDb = undefined;
      throw error;
    });
  }
  return globalForDb.__ceyteqDb;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: SqlParam[] = [],
): Promise<T[]> {
  const db = await getDb();
  return db.query<T>(sql, params);
}

export async function one<T = Record<string, unknown>>(
  sql: string,
  params: SqlParam[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction(fn);
}

export async function databaseInfo() {
  const url = process.env.DATABASE_URL?.trim() || "";
  if (isRemotePostgres(url)) {
    try {
      const row = await one<{ version: string }>("select version() as version");
      return { driver: "node-postgres", host: new URL(url).hostname, version: row?.version ?? null };
    } catch {
      return { driver: "node-postgres", host: null, version: null };
    }
  }
  try {
    const row = await one<{ version: string }>("select version() as version");
    return { driver: "pglite", host: "embedded", version: row?.version ?? null };
  } catch {
    return { driver: "pglite", host: "embedded", version: null };
  }
}

/** Monotonic-ish, URL-safe identifier used for primary keys. */
export function newId(prefix = "c"): string {
  return `${prefix}${Date.now().toString(36)}${randomBytes(6).toString("hex")}`;
}

export { toInt };
