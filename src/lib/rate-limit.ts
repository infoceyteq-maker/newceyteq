import "server-only";

/**
 * Rate limiting for public endpoints and the admin login.
 *
 * Two backends, one API:
 *
 *  • **Upstash Redis** (recommended for production) — used automatically when
 *    `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set. Works across
 *    serverless instances and regions.
 *  • **In-memory sliding window** — the zero-config fallback for local dev and
 *    single-instance deployments.
 *
 * Both expose `consume(key, { limit, windowMs })` returning whether the request
 * is allowed plus the values needed for standard `RateLimit-*` / `Retry-After`
 * response headers.
 */

export type RateLimitRule = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Unix seconds when the current window resets. */
  reset: number;
  retryAfter: number;
};

const now = () => Date.now();

/* ------------------------------ in-memory -------------------------------- */

type Bucket = { hits: number[] };

const memory = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(windowMs: number) {
  const timestamp = now();
  if (timestamp - lastSweep < 30_000) return;
  lastSweep = timestamp;
  for (const [key, bucket] of memory) {
    const fresh = bucket.hits.filter((hit) => timestamp - hit < windowMs);
    if (fresh.length === 0) memory.delete(key);
    else bucket.hits = fresh;
  }
  // Hard cap so a flood of unique keys cannot exhaust memory.
  if (memory.size > 10_000) memory.clear();
}

function consumeMemory(key: string, rule: RateLimitRule): RateLimitResult {
  sweep(rule.windowMs);
  const timestamp = now();
  const bucket = memory.get(key) ?? { hits: [] };
  const hits = bucket.hits.filter((hit) => timestamp - hit < rule.windowMs);

  if (hits.length >= rule.limit) {
    const oldest = hits[0] ?? timestamp;
    const retryAfter = Math.max(1, Math.ceil((rule.windowMs - (timestamp - oldest)) / 1000));
    memory.set(key, { hits });
    return {
      ok: false,
      limit: rule.limit,
      remaining: 0,
      reset: Math.ceil((oldest + rule.windowMs) / 1000),
      retryAfter,
    };
  }

  hits.push(timestamp);
  memory.set(key, { hits });
  return {
    ok: true,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - hits.length),
    reset: Math.ceil((timestamp + rule.windowMs) / 1000),
    retryAfter: 0,
  };
}

/* -------------------------------- upstash --------------------------------- */

function upstashCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function consumeUpstash(
  key: string,
  rule: RateLimitRule,
  credentials: { url: string; token: string },
): Promise<RateLimitResult> {
  // Atomic INCR + PEXPIRE in one round trip.
  const response = await fetch(`${credentials.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PTTL", key],
    ]),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Upstash rate limit failed (${response.status})`);

  const payload = (await response.json()) as Array<{ result: number }>;
  const count = Number(payload[0]?.result ?? 0);
  let ttl = Number(payload[1]?.result ?? -1);

  if (count === 1 || ttl < 0) {
    await fetch(`${credentials.url}/pexpire/${encodeURIComponent(key)}/${rule.windowMs}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${credentials.token}` },
      cache: "no-store",
    });
    ttl = rule.windowMs;
  }

  const retryAfter = Math.max(1, Math.ceil(ttl / 1000));
  return {
    ok: count <= rule.limit,
    limit: rule.limit,
    remaining: Math.max(0, rule.limit - count),
    reset: Math.ceil((now() + Math.max(ttl, 0)) / 1000),
    retryAfter: count > rule.limit ? retryAfter : 0,
  };
}

/* --------------------------------- public --------------------------------- */

/**
 * Consumes one unit of the quota for `key`.
 * Fails open only if the remote limiter itself errors — the request is then
 * allowed rather than dropping legitimate submissions.
 */
export async function consumeRateLimit(
  key: string,
  rule: RateLimitRule,
): Promise<RateLimitResult> {
  const credentials = upstashCredentials();
  if (!credentials) return consumeMemory(key, rule);

  try {
    return await consumeUpstash(key, rule, credentials);
  } catch (error) {
    console.error("[rate-limit] falling back to memory limiter:", error);
    return consumeMemory(key, rule);
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.reset),
  };
  if (!result.ok) headers["Retry-After"] = String(result.retryAfter);
  return headers;
}

/** Test/reset hook — used by the seed script statistics and tests. */
export function resetRateLimits() {
  memory.clear();
}

export const RATE_LIMITS = {
  /** Public form submissions: 5 per minute/IP/form, 30 per hour/IP. */
  submissionShort: { limit: 5, windowMs: 60_000 } satisfies RateLimitRule,
  submissionLong: { limit: 30, windowMs: 60 * 60_000 } satisfies RateLimitRule,
  /** Admin login: 5 attempts per 5 minutes per IP, 20 per hour per IP. */
  loginShort: { limit: 5, windowMs: 5 * 60_000 } satisfies RateLimitRule,
  loginLong: { limit: 20, windowMs: 60 * 60_000 } satisfies RateLimitRule,
  /** Public lead enquiries: 4 per 5 minutes/IP, 20 per hour/IP. */
  leadShort: { limit: 4, windowMs: 5 * 60_000 } satisfies RateLimitRule,
  leadLong: { limit: 20, windowMs: 60 * 60_000 } satisfies RateLimitRule,
  /** Admin write endpoints. */
  adminWrite: { limit: 60, windowMs: 60_000 } satisfies RateLimitRule,
} as const;
