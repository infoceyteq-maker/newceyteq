import { jsonError, jsonOk, readJson } from "@/lib/http";
import { submitLead } from "@/lib/services/leads-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public enquiry endpoint (website contact module).
 *
 * Middleware already enforces JSON content type + origin checks; this handler
 * adds a body-size ceiling and delegates sanitisation, validation and rate
 * limiting to the lead service.
 */
const MAX_BODY_BYTES = 32 * 1024;

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip");
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return jsonError("Message is too large.", 413);
  }

  const parsed = await readJson<{
    data?: unknown;
    meta?: { company_website?: unknown; elapsedMs?: unknown };
  }>(request, MAX_BODY_BYTES);
  if (!parsed.ok) return parsed.response;

  const payload = parsed.data;
  if (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
    return jsonError("No message was received.", 400);
  }

  const result = await submitLead({
    data: payload.data,
    meta: {
      company_website:
        typeof payload.meta?.company_website === "string" ? payload.meta.company_website : "",
      elapsedMs: typeof payload.meta?.elapsedMs === "number" ? payload.meta.elapsedMs : undefined,
    },
    ip: clientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return Response.json(
      { error: result.error, fieldErrors: result.fieldErrors },
      {
        status: result.status,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
        },
      },
    );
  }

  return jsonOk({ ok: true, id: result.id }, 201);
}

export async function GET() {
  return jsonError("Method not allowed.", 405, { Allow: "POST" });
}
