import { requireApiAdmin } from "@/lib/auth";
import { setFormStatus } from "@/lib/services/forms-service";

export const runtime = "nodejs";

const VALID = new Set(["draft", "published", "archived"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;
  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (!body.status || !VALID.has(body.status)) {
    return Response.json({ error: "Unknown status." }, { status: 400 });
  }

  try {
    const form = await setFormStatus(id, body.status as "draft" | "published" | "archived");
    if (!form) return Response.json({ error: "Form not found." }, { status: 404 });
    return Response.json({ ok: true, ...form });
  } catch {
    return Response.json({ error: "Form not found." }, { status: 404 });
  }
}
