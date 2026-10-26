import { requireApiAdmin } from "@/lib/auth";
import {
  removeSubmission,
  setSubmissionStatus,
} from "@/lib/services/submissions-service";

export const runtime = "nodejs";

const VALID = new Set(["new", "reviewed", "archived"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;
  let body: { status?: string; notes?: string };
  try {
    body = (await request.json()) as { status?: string; notes?: string };
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (body.status && !VALID.has(body.status)) {
    return Response.json({ error: "Unknown status." }, { status: 400 });
  }

  try {
    const submission = await setSubmissionStatus(id, {
      status: body.status,
      notes: typeof body.notes === "string" ? body.notes.slice(0, 4000) : undefined,
      reviewedById: user.id,
    });
    if (!submission) return Response.json({ error: "Submission not found." }, { status: 404 });
    return Response.json({
      ok: true,
      id: submission.id,
      status: submission.status,
      notes: submission.notes,
    });
  } catch {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;
  try {
    await removeSubmission(id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }
}
