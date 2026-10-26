import { requireApiAdmin } from "@/lib/auth";
import { exportLeads } from "@/lib/services/leads-service";
import { toCsv } from "@/lib/services/submissions-service";
import { leadChannelLabel, leadSourceLabel } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const channel = url.searchParams.get("channel") ?? undefined;
  const source = url.searchParams.get("source") ?? undefined;

  const leads = await exportLeads({ status, channel, source });

  const rows = leads.map((lead) => ({
    created: new Date(lead.createdAt).toISOString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    channel: leadChannelLabel(lead.channel),
    source: leadSourceLabel(lead.source),
    status: lead.status,
    message: lead.message,
    notes: lead.notes,
  }));

  const columns = [
    { key: "created", label: "Received (UTC)" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "company", label: "Business" },
    { key: "channel", label: "Channel" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "message", label: "Message" },
    { key: "notes", label: "Internal notes" },
  ];

  const csv = toCsv(rows, columns);
  const filename = `ceyteq-leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
