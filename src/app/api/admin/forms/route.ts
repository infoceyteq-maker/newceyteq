import { requireApiAdmin } from "@/lib/auth";
import {
  createBlankForm,
  createFormFromTemplate,
  listForms,
} from "@/lib/services/forms-service";
import { RESTAURANT_TEMPLATE } from "@/lib/templates";
import { guardAdminWrite, jsonError, jsonOk, readJson } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;
  return jsonOk({ forms: await listForms() });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const parsed = await readJson<{ template?: string }>(request);
  if (!parsed.ok) return parsed.response;

  const template = parsed.data.template === "restaurant" ? "restaurant" : "blank";
  const form =
    template === "restaurant"
      ? await createFormFromTemplate(RESTAURANT_TEMPLATE, user.id)
      : await createBlankForm(user.id);

  return jsonOk({ id: form.id, slug: form.slug }, 201);
}
