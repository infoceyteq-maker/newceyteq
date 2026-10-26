import { requireApiAdmin } from "@/lib/auth";
import { guardAdminWrite, jsonError, jsonOk, readJson } from "@/lib/http";
import { LEAD_STATUSES } from "@/lib/leads";
import { removeLead, setLeadStatus } from "@/lib/services/leads-service";
import { sanitizeMultiline } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUS = new Set(LEAD_STATUSES.map((status) => status.value as string));

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;
  const parsed = await readJson<{ status?: string; notes?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const body = parsed.data;
  if (body.status && !VALID_STATUS.has(body.status)) {
    return jsonError("Unknown lead status.", 400);
  }

  const lead = await setLeadStatus(id, {
    status: body.status,
    notes: typeof body.notes === "string" ? sanitizeMultiline(body.notes, 4000) : undefined,
  });

  if (!lead) return jsonError("Lead not found.", 404);
  return jsonOk({ ok: true, lead });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;
  const removed = await removeLead(id);
  if (!removed) return jsonError("Lead not found.", 404);
  return jsonOk({ ok: true });
}
