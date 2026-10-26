import { getPublishedFormBySlug } from "@/lib/services/forms-service";
import { submitForm } from "@/lib/services/submissions-service";

/**
 * Public submission endpoint.
 *
 * Hardening applied here:
 *  • strict body-size ceiling before parsing
 *  • JSON content-type enforced by middleware
 *  • honeypot + timing + distributed rate limiting in the service
 *  • schema-driven validation/sanitisation of every field
 *  • no-store responses and rate-limit headers for well behaved clients
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB is ample for this form

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip");
}

const baseHeaders = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: baseHeaders });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  if (!/^[a-z0-9-]{2,64}$/.test(slug)) {
    return Response.json({ error: "Form not found." }, { status: 404, headers: baseHeaders });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return Response.json(
      { error: "Submission is too large." },
      { status: 413, headers: baseHeaders },
    );
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json(
        { error: "Submission is too large." },
        { status: 413, headers: baseHeaders },
      );
    }
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400, headers: baseHeaders });
  }

  const payload = (body ?? {}) as {
    data?: unknown;
    meta?: {
      company_website?: unknown;
      elapsedMs?: unknown;
      startedAt?: unknown;
    };
  };

  if (!payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) {
    return Response.json({ error: "No answers were received." }, { status: 400, headers: baseHeaders });
  }

  const form = await getPublishedFormBySlug(slug);
  if (!form) {
    return Response.json(
      { error: "This form is not available." },
      { status: 404, headers: baseHeaders },
    );
  }

  const result = await submitForm(form, {
    data: payload.data,
    meta: {
      company_website:
        typeof payload.meta?.company_website === "string" ? payload.meta.company_website : "",
      elapsedMs: typeof payload.meta?.elapsedMs === "number" ? payload.meta.elapsedMs : undefined,
      startedAt: typeof payload.meta?.startedAt === "number" ? payload.meta.startedAt : undefined,
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
          ...baseHeaders,
          ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
        },
      },
    );
  }

  return Response.json(
    { ok: true, reference: result.reference, id: result.submissionId },
    { status: 201, headers: baseHeaders },
  );
}

/** Explicit 405 keeps the surface tight and avoids Next's default HTML error. */
export async function GET() {
  return Response.json(
    { error: "Method not allowed." },
    { status: 405, headers: { ...baseHeaders, Allow: "POST, OPTIONS" } },
  );
}
