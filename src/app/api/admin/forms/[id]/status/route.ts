import { requireApiAdmin } from "@/lib/auth";
import { setFormStatus } from "@/lib/services/forms-service";
import { guardAdminWrite, jsonError, jsonOk, readJson } from "@/lib/http";

export const runtime = "nodejs";

const VALID = new Set(["draft", "published", "archived"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const { id } = await context.params;
  const parsed = await readJson<{ status?: string }>(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (!body.status || !VALID.has(body.status)) {
    return jsonError("Unknown status.", 400);
  }

  try {
    const form = await setFormStatus(id, body.status as "draft" | "published" | "archived");
    if (!form) return jsonError("Form not found.", 404);
    return jsonOk({ ok: true, ...form });
  } catch {
    return jsonError("Form not found.", 404);
  }
}
