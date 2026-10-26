import { requireApiAdmin } from "@/lib/auth";
import { getFormById } from "@/lib/services/forms-service";
import { parseOptions } from "@/lib/forms";
import { listSubmissions, toCsv } from "@/lib/services/submissions-service";
import { displayValue } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = await requireApiAdmin();
  if (response) return response;

  const url = new URL(request.url);
  const formId = url.searchParams.get("formId") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const submissions = await listSubmissions({ formId, status, take: 5000 });
  const form = formId ? await getFormById(formId) : null;

  const fieldColumns =
    form?.sections.flatMap((section) =>
      section.fields.map((field) => ({
        key: field.key,
        label: `${section.title} — ${field.label}`,
        options: parseOptions(field.options),
      })),
    ) ?? [];

  const spansForms = !form;

  const rows = submissions.map((submission) => {
    const row: Record<string, unknown> = {
      reference: submission.reference,
      submitted: submission.createdAt,
      status: submission.status,
      form: submission.formTitle,
    };
    for (const column of fieldColumns) {
      const raw = submission.data[column.key];
      if (Array.isArray(raw) && column.options.length > 0) {
        const map = new Map(column.options.map((option) => [option.value, option.label]));
        row[column.key] = raw
          .map((item) => {
            if (typeof item === "string") return map.get(item) ?? item;
            const record = item as { platform?: string; url?: string };
            const platform = map.get(record.platform ?? "") ?? record.platform;
            return [platform, record.url].filter(Boolean).join(": ");
          })
          .join(" | ");
      } else {
        row[column.key] = displayValue(raw);
      }
    }
    if (spansForms) {
      row.answers = Object.entries(submission.data)
        .map(([key, value]) => `${key}: ${displayValue(value)}`)
        .join(" | ");
    }
    return row;
  });

  const columns = [
    { key: "reference", label: "Reference" },
    { key: "submitted", label: "Submitted" },
    { key: "status", label: "Status" },
    { key: "form", label: "Form" },
    ...(spansForms ? [{ key: "answers", label: "Answers" }] : []),
    ...fieldColumns.map((column) => ({ key: column.key, label: column.label })),
  ];

  const csv = toCsv(rows, columns);
  const filename = `${(form?.slug ?? "ceyteq-submissions")}-${new Date().toISOString().slice(0, 10)}.csv`;

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
