import { getPublishedFormBySlug } from "@/lib/services/forms-service";
import { submitForm } from "@/lib/services/submissions-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const payload = (body ?? {}) as {
    data?: unknown;
    meta?: { company_website?: string; elapsedMs?: number; startedAt?: number };
  };

  if (!payload.data || typeof payload.data !== "object") {
    return Response.json({ error: "No answers were received." }, { status: 400 });
  }

  const form = await getPublishedFormBySlug(slug);
  if (!form) {
    return Response.json({ error: "This form is not available." }, { status: 404 });
  }

  const result = await submitForm(form, {
    data: payload.data,
    meta: payload.meta,
    ip: clientIp(request),
    userAgent: request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return Response.json(
      { error: result.error, fieldErrors: result.fieldErrors },
      { status: result.status },
    );
  }

  return Response.json({ ok: true, reference: result.reference, id: result.submissionId }, { status: 201 });
}
