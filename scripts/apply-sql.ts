/**
 * Apply a SQL file to the database in `DATABASE_URL`.
 *
 *   npm run db:apply -- supabase/realtime.sql
 *
 * Used for the pieces that the app never runs itself — RLS policies, the
 * `supabase_realtime` publication and the pg_cron trim job. Safe to re-run:
 * every statement in those files is idempotent.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

try {
  (process as NodeJS.Process & { loadEnvFile?: (path: string) => void }).loadEnvFile?.(".env");
} catch {
  // No .env file — rely on the process environment.
}

const target = process.argv[2];
if (!target) {
  console.error("Usage: npm run db:apply -- <file.sql>");
  process.exit(1);
}

const url = process.env.DATABASE_URL?.trim();
if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
  console.error("DATABASE_URL must point at PostgreSQL (e.g. the Supabase pooler).");
  process.exit(1);
}

const sql = readFileSync(path.resolve(process.cwd(), target), "utf8");

async function main() {
  const { Client } = await import("pg");
  const client = new Client({
    connectionString: url,
    ssl: /supabase|neon|render|amazonaws|sslmode=require/i.test(url)
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log(`applied ${target}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
