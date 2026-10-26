import { requireApiAdmin } from "@/lib/auth";
import { removeSubmission, setSubmissionStatus } from "@/lib/services/submissions-service";
import { guardAdminWrite, jsonError, jsonOk, readJson } from "@/lib/http";
import { sanitizeMultiline } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = new Set(["new", "reviewed", "archived"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;

  const parsed = await readJson<{ status?: string; notes?: string }>(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (body.status && !VALID.has(body.status)) {
    return jsonError("Unknown status.", 400);
  }

  try {
    const submission = await setSubmissionStatus(id, {
      status: body.status,
      notes: typeof body.notes === "string" ? sanitizeMultiline(body.notes, 4000) : undefined,
      reviewedById: user.id,
    });
    if (!submission) return jsonError("Submission not found.", 404);
    return jsonOk({
      ok: true,
      id: submission.id,
      status: submission.status,
      notes: submission.notes,
    });
  } catch {
    return jsonError("Submission not found.", 404);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;
  try {
    await removeSubmission(id);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Submission not found.", 404);
  }
}
