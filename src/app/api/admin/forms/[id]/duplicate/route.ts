import { requireApiAdmin } from "@/lib/auth";
import { duplicateForm } from "@/lib/services/forms-service";
import { guardAdminWrite, jsonError, jsonOk } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;
  try {
    const copy = await duplicateForm(id, user.id);
    return jsonOk({ ok: true, id: copy.id, slug: copy.slug }, 201);
  } catch {
    return jsonError("Unable to duplicate this form.", 400);
  }
}
