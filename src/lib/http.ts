/**
 * Shared HTTP helpers for route handlers.
 *
 * Keeps the security posture identical across every API route: no-store
 * responses, size-limited JSON parsing, consistent error shapes, and a single
 * rate-limit guard for authenticated writes.
 */

import { RATE_LIMITS, consumeRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const NO_STORE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

/** Default ceiling for authenticated JSON payloads (form definitions, notes). */
export const MAX_JSON_BYTES = 512 * 1024;

export function jsonError(message: string, status: number, extraHeaders: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: { ...NO_STORE_HEADERS, ...extraHeaders } });
}

export function jsonOk(payload: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return Response.json(payload, { status, headers: { ...NO_STORE_HEADERS, ...extraHeaders } });
}

type ReadResult<T> = { ok: true; data: T } | { ok: false; response: Response };

/** Parse a JSON body with an explicit size ceiling and shape check. */
export async function readJson<T>(request: Request, maxBytes = MAX_JSON_BYTES): Promise<ReadResult<T>> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared && declared > maxBytes) {
    return { ok: false, response: jsonError("Payload is too large.", 413) };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, response: jsonError("Could not read the request body.", 400) };
  }

  if (raw.length > maxBytes) {
    return { ok: false, response: jsonError("Payload is too large.", 413) };
  }

  try {
    const data = JSON.parse(raw) as T;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, response: jsonError("Expected a JSON object.", 400) };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, response: jsonError("Invalid JSON payload.", 400) };
  }
}

/**
 * Rate-limit an authenticated write. Returns a 429 response when the caller has
 * exceeded the admin write budget, or `null` when the request may proceed.
 */
export async function guardAdminWrite(userId: string): Promise<Response | null> {
  const result = await consumeRateLimit(`rl:admin-write:${userId}`, RATE_LIMITS.adminWrite);
  if (result.ok) return null;
  return jsonError("Too many changes in a short time. Please slow down.", 429, {
    ...rateLimitHeaders(result),
    "Retry-After": String(result.retryAfter),
  });
}
