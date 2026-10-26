import "server-only";

import { z } from "zod";

/**
 * Runtime environment validation.
 *
 * Secrets live only in the server environment (never `NEXT_PUBLIC_*`). In
 * production the app refuses to start a request handler with an unsafe
 * configuration instead of silently falling back to development defaults.
 */

const PLACEHOLDER_SECRETS = new Set([
  "change-me",
  "change-me-to-a-long-random-string",
  "local-dev-secret-ceyteq-digital-race-change-me",
  "secret",
  "development",
]);

/**
 * `.env` files usually declare optional values as `KEY=""`. Treat a blank or
 * whitespace-only value exactly like an unset variable so optional validators
 * (`.url()`, `.email()`) never reject an empty placeholder.
 */
const optionalString = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().trim().optional(),
);

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.string().trim().url().optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** PostgreSQL connection string (Supabase pooler in production). */
  DATABASE_URL: z.string().trim().optional().default(""),
  PGLITE_DATA_DIR: optionalString,

  /** Session + IP hashing secret. Minimum 32 random characters in production. */
  AUTH_SECRET: z.string().trim().optional().default(""),

  /** Bootstrap administrator (used only when the admin table is empty). */
  ADMIN_EMAIL: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().email().optional(),
  ),
  ADMIN_PASSWORD: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(8).optional(),
  ),
  ADMIN_NAME: optionalString,

  NEXT_PUBLIC_SITE_URL: optionalUrl,

  /**
   * Supabase project URL + anon (publishable) key. Only used in the browser to
   * subscribe to the PII-free `ceyteq_signals` change feed — never for reads.
   */
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,

  /** Optional comma separated extra origins allowed to call the public API. */
  ALLOWED_ORIGINS: optionalString,

  /** Optional Upstash Redis for distributed rate limiting. */
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration → ${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isRemoteDatabase(url: string | undefined) {
  return /^postgres(ql)?:\/\//i.test(url ?? "");
}

/**
 * Security-relevant checks. Throws in production so a misconfigured deployment
 * fails loudly on the first request instead of running with dev defaults.
 * Returns warnings in development so local work stays frictionless.
 */
export function assertSecureConfiguration(): string[] {
  const env = getEnv();
  const problems: string[] = [];
  const warnings: string[] = [];

  const secret = env.AUTH_SECRET;
  if (!secret) {
    problems.push("AUTH_SECRET is not set. Generate one with: openssl rand -base64 48");
  } else if (secret.length < 32) {
    problems.push("AUTH_SECRET must be at least 32 characters long.");
  } else if (PLACEHOLDER_SECRETS.has(secret.toLowerCase())) {
    problems.push("AUTH_SECRET is still set to a placeholder value.");
  }

  if (!isRemoteDatabase(env.DATABASE_URL)) {
    problems.push(
      "DATABASE_URL must be a PostgreSQL connection string (Supabase pooler) in production.",
    );
  }

  if (!env.NEXT_PUBLIC_SITE_URL) {
    warnings.push("NEXT_PUBLIC_SITE_URL is not set; canonical URLs fall back to the request host.");
  }

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    warnings.push(
      "Upstash Redis is not configured; rate limiting uses per-instance memory.",
    );
  }

  if (isProduction() && problems.length > 0) {
    throw new Error(
      `Insecure production configuration:\n- ${problems.join("\n- ")}\n` +
        "See .env.example and the deployment section of README.md.",
    );
  }

  return [...problems, ...warnings];
}

/** Public site origin used for canonical URLs and metadata. */
export function siteOrigin(requestOrigin?: string | null) {
  try {
    const configured = getEnv().NEXT_PUBLIC_SITE_URL;
    if (isProduction() && configured) return configured.replace(/\/$/, "");
  } catch {
    // fall through to the request host
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  return requestOrigin?.replace(/\/$/, "") || "http://localhost:3000";
}

/** Origins permitted to call the API cross-origin. */
export function allowedOrigins(): string[] {
  const env = getEnv();
  const configured = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL ? [env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")] : [];
  const vercel = process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [];

  return Array.from(new Set([...siteUrl, ...vercel, ...configured]));
}

export function bootstrapAdmin() {
  const env = getEnv();
  return {
    email: env.ADMIN_EMAIL?.toLowerCase() ?? null,
    password: env.ADMIN_PASSWORD ?? null,
    name: env.ADMIN_NAME ?? "Ceyteq Administrator",
  };
}
