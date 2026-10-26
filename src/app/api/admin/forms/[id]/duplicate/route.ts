import { requireApiAdmin } from "@/lib/auth";
import { duplicateForm } from "@/lib/services/forms-service";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;
  try {
    const copy = await duplicateForm(id, user.id);
    return Response.json({ ok: true, id: copy.id, slug: copy.slug }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to duplicate this form." }, { status: 400 });
  }
}
