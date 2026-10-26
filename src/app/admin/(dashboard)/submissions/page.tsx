import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SubmissionFilters } from "@/components/admin/SubmissionFilters";
import { listSubmissions, submissionCounts } from "@/lib/services/submissions-service";
import { listForms } from "@/lib/services/forms-service";
import { displayValue, formatDateTime, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Responses" };

type SearchParams = Promise<{ formId?: string; status?: string; q?: string }>;

export default async function SubmissionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { formId, status, q } = await searchParams;

  const [forms, submissions, grouped] = await Promise.all([
    listForms(),
    listSubmissions({ formId, status, query: q, take: 200 }),
    submissionCounts(),
  ]);

  const counts = grouped;

  const exportQuery = new URLSearchParams();
  if (formId) exportQuery.set("formId", formId);
  if (status) exportQuery.set("status", status);

  return (
    <div className="space-y-5">
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8">
        <div className="glow-blob -right-8 -top-12 h-40 w-40 bg-ash-50" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
              <span className="neon-dot" />
              Responses
            </p>
            <h1 className="mt-2 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[30px]">
              Form responses
            </h1>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-navy-400">
              Every response captured from your published links, validated against the current form
              schema.
            </p>
          </div>
          <a
            href={`/api/admin/submissions/export${exportQuery.toString() ? `?${exportQuery.toString()}` : ""}`}
            className="neu-btn !px-4 !py-2.5 !text-[12.5px]"
          >
            <Icon.download size={15} className="text-ceyteq-500" />
            Export CSV
          </a>
        </div>
      </header>

      <SubmissionFilters forms={forms.map((form) => ({ id: form.id, title: form.title }))} counts={counts} />

      {submissions.length === 0 ? (
        <div className="neu-raised grid place-items-center rounded-neu-lg px-6 py-16 text-center">
          <span className="neu-orb h-16 w-16 text-navy-300">
            <Icon.inbox size={24} />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-navy-700">Nothing in the inbox</h2>
          <p className="mt-2 max-w-sm text-[13.5px] text-navy-400">
            {q || formId || status
              ? "No submissions match these filters. Try clearing them."
              : "Share a published form link and responses will appear here instantly."}
          </p>
          <Link href="/admin/forms" className="neu-btn mt-6 !py-2.5">
            <Icon.forms size={15} className="text-ceyteq-500" />
            Manage forms
          </Link>
        </div>
      ) : (
        <div className="neu-raised rounded-neu-lg p-2.5 sm:p-3">
          <div className="neu-well overflow-hidden rounded-3xl">
            <div className="overflow-x-auto p-2">
              <table className="w-full min-w-[860px] border-separate border-spacing-y-1.5 text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-300">
                  <th className="px-4 pb-1.5 font-bold">Reference</th>
                  <th className="px-4 pb-1.5 font-bold">Form</th>
                  <th className="px-4 pb-1.5 font-bold">Key answers</th>
                  <th className="px-4 pb-1.5 font-bold">Received</th>
                  <th className="px-4 pb-1.5 font-bold">Status</th>
                  <th className="px-4 pb-1.5" />
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const values = Object.values(submission.data).filter(Boolean).slice(0, 2);
                  return (
                    <tr key={submission.id} className="group">
                      <td className="rounded-l-2xl bg-ash-100/80 px-4 py-3 group-hover:bg-ash-100">
                        <Link
                          href={`/admin/submissions/${submission.id}`}
                          className="font-display text-[12.5px] font-semibold text-ceyteq-600 hover:underline"
                        >
                          {submission.reference}
                        </Link>
                      </td>
                      <td className="bg-ash-100/80 px-4 py-3 group-hover:bg-ash-100">
                        <span className="text-[12.5px] font-semibold text-navy-500">
                          {submission.formTitle}
                        </span>
                      </td>
                      <td className="max-w-[320px] bg-ash-100/80 px-4 py-3 group-hover:bg-ash-100">
                        <div className="space-y-0.5">
                          {values.length > 0 ? (
                            values.map((value, index) => (
                              <p
                                key={index}
                                className="truncate text-[12px] font-medium text-navy-400"
                              >
                                {displayValue(value)}
                              </p>
                            ))
                          ) : (
                            <p className="text-[12px] text-navy-300">—</p>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-ash-100/80 px-4 py-3 group-hover:bg-ash-100">
                        <span className="block text-[12px] font-semibold text-navy-500">
                          {relativeTime(submission.createdAt)}
                        </span>
                        <span className="block text-[10.5px] text-navy-300">
                          {formatDateTime(submission.createdAt)}
                        </span>
                      </td>
                      <td className="bg-ash-100/80 px-4 py-3 group-hover:bg-ash-100">
                        <StatusPill status={submission.status} />
                      </td>
                      <td className="rounded-r-2xl bg-ash-100/80 px-4 py-3 text-right group-hover:bg-ash-100">
                        <Link
                          href={`/admin/submissions/${submission.id}`}
                          className="neu-btn !px-3 !py-1.5 !text-[11px]"
                        >
                          Open
                          <Icon.chevronRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
          <div className="neu-divider my-2.5" />
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-1 text-[11.5px] font-semibold text-navy-300">
            <span>
              Showing {submissions.length} of {counts.all} submissions
            </span>
            <span className="flex items-center gap-1.5">
              <Icon.shield size={12} />
              Server-validated
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    new: { className: "bg-ceyteq-100/90 text-ceyteq-700", label: "New" },
    reviewed: { className: "bg-emerald-100/80 text-emerald-700", label: "Reviewed" },
    archived: { className: "bg-ash-100 text-navy-400 shadow-neu-inset-sm", label: "Archived" },
  };
  const item = map[status] ?? { className: "bg-ash-100 text-navy-400", label: status };
  return <span className={`neu-badge ${item.className}`}>{item.label}</span>;
}
