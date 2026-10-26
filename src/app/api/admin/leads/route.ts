import { requireApiAdmin } from "@/lib/auth";
import { guardAdminWrite, jsonError, jsonOk, readJson } from "@/lib/http";
import { createLeadFromAdmin } from "@/lib/services/leads-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a lead from the control centre. Admin-only and rate limited through
 * the shared admin write budget; the public endpoint (`POST /api/leads`) keeps
 * its own anti-spam guards and is untouched.
 */
export async function POST(request: Request) {
  const { user, response } = await requireApiAdmin();
  if (response) return response;

  const limited = await guardAdminWrite(user.id);
  if (limited) return limited;

  const parsed = await readJson<Record<string, unknown>>(request);
  if (!parsed.ok) return parsed.response;

  const result = await createLeadFromAdmin(parsed.data);
  if (!result.ok) {
    return Response.json(
      { error: result.error, fieldErrors: result.fieldErrors ?? {} },
      { status: result.status, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  return jsonOk({ ok: true, id: result.id }, 201);
}

export async function GET() {
  const { response } = await requireApiAdmin();
  if (response) return response;
  return jsonError("Use GET /api/admin/leads/export for the CSV feed.", 405);
}
