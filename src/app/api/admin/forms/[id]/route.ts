import { requireApiAdmin } from "@/lib/auth";
import { guardAdminWrite, jsonError, jsonOk, readJson } from "@/lib/http";
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
  if (!form) return jsonError("Form not found.", 404);
  return jsonOk({ form: toPlainForm(form) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;

  const parsed = await readJson<{
    definition?: FormDefinitionInput;
    status?: "draft" | "published" | "archived";
  }>(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (!body.definition || !Array.isArray(body.definition.sections)) {
    return jsonError("A form definition is required.", 400);
  }
  if (body.status && !["draft", "published", "archived"].includes(body.status)) {
    return jsonError("Unknown status.", 400);
  }

  try {
    const form = await saveFormDefinition(id, body.definition, body.status);
    return jsonOk({ ok: true, slug: form.slug, status: form.status, updatedAt: form.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save this form.";
    return jsonError(message, 400);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;
  try {
    await deleteForm(id);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Form could not be deleted.", 400);
  }
}
