import { requireApiAdmin } from "@/lib/auth";
import {
  createBlankForm,
  createFormFromTemplate,
  listForms,
} from "@/lib/services/forms-service";
import { PARTNER_TEMPLATE, RESTAURANT_TEMPLATE } from "@/lib/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;
  return Response.json({ forms: await listForms() });
}

export async function POST(request: Request) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  let body: { template?: string } = {};
  try {
    body = (await request.json()) as { template?: string };
  } catch {
    body = {};
  }

  const template = body.template ?? "blank";
  const form =
    template === "restaurant"
      ? await createFormFromTemplate(RESTAURANT_TEMPLATE, user.id)
      : template === "partner"
        ? await createFormFromTemplate(PARTNER_TEMPLATE, user.id)
        : await createBlankForm(user.id);

  return Response.json({ id: form.id, slug: form.slug }, { status: 201 });
}
