import { requireApiAdmin } from "@/lib/auth";
import {
  deleteForm,
  getFormById,
  saveFormDefinition,
  type FormDefinitionInput,
} from "@/lib/services/forms-service";
import { toPlainForm } from "@/lib/services/forms-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;
  const form = await getFormById(id);
  if (!form) return Response.json({ error: "Form not found." }, { status: 404 });
  return Response.json({ form: toPlainForm(form) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;

  let body: { definition?: FormDefinitionInput; status?: "draft" | "published" | "archived" };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!body.definition) {
    return Response.json({ error: "A form definition is required." }, { status: 400 });
  }

  try {
    const form = await saveFormDefinition(id, body.definition, body.status);
    return Response.json({ ok: true, slug: form.slug, status: form.status, updatedAt: form.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save this form.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const { id } = await context.params;
  try {
    await deleteForm(id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Form could not be deleted." }, { status: 400 });
  }
}
