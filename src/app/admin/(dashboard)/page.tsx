import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CreateFormButton } from "@/components/admin/CreateFormButton";
import { ModuleCards } from "@/components/admin/ModuleCards";
import { AddLeadButton } from "@/components/admin/AddLeadButton";
import { requireAdmin } from "@/lib/auth";
import { dashboardStats, listSubmissions } from "@/lib/services/submissions-service";
import { listForms } from "@/lib/services/forms-service";
import { leadStats, recentLeadRows } from "@/lib/services/leads-service";
import { LEAD_STATUSES, leadChannelIcon, leadChannelLabel } from "@/lib/leads";
import { roleLabel } from "@/lib/admin-modules";
import { displayValue, formatDateTime, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const user = await requireAdmin();
  const [stats, submissions, forms, leads, latestLeads] = await Promise.all([
    dashboardStats(),
    listSubmissions({ take: 6 }),
    listForms(),
    leadStats(),
    recentLeadRows(4),
  ]);

  const maxBucket = Math.max(1, ...stats.buckets.map((bucket) => bucket.count));
  const topForm = [...forms].sort((a, b) => b.submissionCount - a.submissionCount)[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8 sm:py-7">
        <div className="glow-blob -right-8 -top-10 h-40 w-40 bg-ash-50" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {formatDateTime(new Date())} · Colombo
            </p>
            <h1 className="mt-2.5 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[32px]">
              Good to see you, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-1 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
              <Icon.shield size={12} className="text-ceyteq-500" />
              {roleLabel(user.role)}
            </p>
            <p className="mt-1.5 text-[13.5px] text-navy-400">
              {stats.newCount > 0
                ? `${stats.newCount} new submission${stats.newCount === 1 ? "" : "s"} waiting for review.`
                : "Everything is reviewed. Nice work keeping the queue clear."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <CreateFormButton template="restaurant" label="New from template" variant="primary" icon="sparkles" />
            <CreateFormButton template="blank" label="Blank form" icon="plus" />
            <AddLeadButton label="Add lead" />
          </div>
        </div>
      </header>

      {/* Every system in the control centre, straight from the registry */}
      <ModuleCards
        counts={{
          forms: stats.formCount,
          newSubmissions: stats.newCount,
          submissions: stats.submissionCount,
          clients: stats.submissionCount,
          newLeads: leads.newCount,
          leads: leads.total,
        }}
      />

      {/* Partitioned stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Restaurant clients",
            value: stats.submissionCount,
            sub: `${stats.newCount} awaiting review`,
            icon: "store" as const,
            href: "/admin/clients",
          },
          {
            label: "Leads & inquiries",
            value: leads.total,
            sub: `${leads.newCount} new · ${leads.bySource.social ?? 0} from social`,
            icon: "mail" as const,
            href: "/admin/leads",
            highlight: leads.newCount > 0,
          },
          {
            label: "Form links",
            value: stats.formCount,
            sub: `${stats.publishedCount} published`,
            icon: "forms" as const,
            href: "/admin/forms",
          },
          {
            label: "Awaiting review",
            value: stats.newCount,
            sub: stats.newCount ? "action needed" : "all clear",
            icon: "clock" as const,
            href: "/admin/submissions",
            highlight: stats.newCount > 0,
          },
        ].map((card) => {
          const Glyph = Icon[card.icon];
          return (
            <Link key={card.label} href={card.href} className="neu-3d neu-click-card rounded-neu p-5">
              <div className="flex items-start justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                  {card.label}
                </p>
                <span
                  className="neu-orb h-9 w-9 text-ceyteq-500"
                  data-active={card.highlight ? "true" : undefined}
                >
                  <Glyph size={16} />
                </span>
              </div>
              <div className="neu-well mt-3.5 rounded-2xl px-3.5 py-3">
                <p className="stat-value text-[28px]">{card.value}</p>
                <p className="mt-1.5 truncate text-[11px] font-semibold text-navy-300">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Chart */}
        <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-navy-700">Submission activity</h2>
              <p className="text-[12px] font-medium text-navy-300">Last 7 days</p>
            </div>
            <span className="neu-badge bg-ash-100 text-navy-400">
              <Icon.bolt size={11} className="text-ceyteq-500" />
              {stats.buckets.reduce((total, bucket) => total + bucket.count, 0)} this week
            </span>
          </div>

          <div className="mt-7 flex h-44 items-end gap-2 sm:gap-3">
            {stats.buckets.map((bucket) => {
              const height = Math.round((bucket.count / maxBucket) * 100);
              return (
                <div key={bucket.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10.5px] font-bold text-navy-300 opacity-0 transition-opacity group-hover:opacity-100">
                    {bucket.count}
                  </span>
                  <div className="neu-sunken relative flex w-full flex-1 items-end overflow-hidden rounded-xl">
                    <div
                      className="w-full rounded-xl bg-[linear-gradient(180deg,#3DA5FF,#2F6BFF)] shadow-[0_0_16px_rgba(61,165,255,0.4)] transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy-300">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Forms quick access */}
        <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-navy-700">Form links</h2>
            <Link href="/admin/forms" className="neu-btn-ghost !px-2.5 !py-1.5 !text-[11.5px]">
              Generator
              <Icon.chevronRight size={13} />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {forms.slice(0, 4).map((form) => (
              <Link
                key={form.id}
                href={`/admin/forms/${form.id}`}
                className="neu flex items-center gap-3 rounded-2xl p-3 transition-transform hover:-translate-y-0.5"
              >
                <span className="neu-inset grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ceyteq-500">
                  <Icon.forms size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-navy-600">{form.title}</p>
                  <p className="truncate text-[11px] font-medium text-navy-300">
                    /{form.slug} · {form.submissionCount} submissions
                  </p>
                </div>
                <StatusPill status={form.status} />
              </Link>
            ))}
            {forms.length === 0 ? (
              <p className="neu-sunken rounded-2xl px-4 py-6 text-center text-[12.5px] font-semibold text-navy-300">
                No forms yet — create your first one.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
      {/* Latest leads */}
      <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-navy-700">Latest leads</h2>
            <p className="text-[12px] font-medium text-navy-300">Social, email &amp; website</p>
          </div>
          <Link href="/admin/leads" className="neu-btn !px-4 !py-2 !text-[12px]">
            Open pipeline
            <Icon.arrowRight size={13} />
          </Link>
        </div>

        <div className="neu-well mt-4 flex flex-wrap gap-1.5 rounded-2xl p-2.5">
          {LEAD_STATUSES.map((stage) => {
            const count = stage.value === "new" ? leads.newCount : leads.byStatus[stage.value] ?? 0;
            return (
              <Link
                key={stage.value}
                href={`/admin/leads?status=${stage.value}`}
                className="inline-flex items-center gap-1.5 rounded-pill bg-ash-100 px-2.5 py-1 text-[10.5px] font-bold text-navy-400 shadow-neu-inset-sm transition-all duration-250 hover:-translate-y-0.5 hover:text-navy-700"
              >
                {stage.label}
                <span className="text-ceyteq-500">{count}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 space-y-2.5">
          {latestLeads.length === 0 ? (
            <p className="neu-sunken rounded-2xl px-4 py-8 text-center text-[12.5px] font-semibold text-navy-300">
              No enquiries yet. The contact form on the home page feeds this pipeline.
            </p>
          ) : (
            latestLeads.map((lead) => {
              const Glyph = Icon[leadChannelIcon(lead.channel)];
              return (
                <div key={lead.id} className="neu flex items-start gap-3 rounded-2xl p-3">
                  <span className="neu-orb h-9 w-9 shrink-0 text-ceyteq-500">
                    <Glyph size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-navy-600">{lead.name}</p>
                    <p className="truncate text-[11.5px] font-medium text-navy-300">
                      {leadChannelLabel(lead.channel)} · {lead.email}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10.5px] font-semibold text-navy-300">
                    {relativeTime(lead.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Recent submissions */}
      <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-navy-700">Latest submissions</h2>
            <p className="text-[12px] font-medium text-navy-300">Newest first</p>
          </div>
          <Link href="/admin/submissions" className="neu-btn !px-4 !py-2 !text-[12px]">
            View all
            <Icon.arrowRight size={13} />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {submissions.length === 0 ? (
            <p className="neu-sunken rounded-2xl px-4 py-8 text-center text-[12.5px] font-semibold text-navy-300">
              No submissions yet. Publish a form and share its link.
            </p>
          ) : (
            <table className="w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-navy-300">
                  <th className="px-3 pb-1 font-bold">Reference</th>
                  <th className="px-3 pb-1 font-bold">Form</th>
                  <th className="px-3 pb-1 font-bold">Preview</th>
                  <th className="px-3 pb-1 font-bold">Received</th>
                  <th className="px-3 pb-1 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="group">
                    <td className="rounded-l-2xl bg-ash-100/80 px-3 py-2.5 group-hover:bg-ash-100">
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="font-display text-[12.5px] font-semibold text-ceyteq-600 hover:underline"
                      >
                        {submission.reference}
                      </Link>
                    </td>
                    <td className="bg-ash-100/80 px-3 py-2.5 text-[12.5px] font-semibold text-navy-500 group-hover:bg-ash-100">
                      {submission.formTitle}
                    </td>
                    <td className="max-w-[220px] truncate bg-ash-100/80 px-3 py-2.5 text-[12px] font-medium text-navy-300 group-hover:bg-ash-100">
                      {displayValue(Object.values(submission.data)[0])}
                    </td>
                    <td className="whitespace-nowrap bg-ash-100/80 px-3 py-2.5 text-[11.5px] font-semibold text-navy-300 group-hover:bg-ash-100">
                      {relativeTime(submission.createdAt)}
                    </td>
                    <td className="rounded-r-2xl bg-ash-100/80 px-3 py-2.5 group-hover:bg-ash-100">
                      <SubmissionStatusPill status={submission.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-100/80 text-emerald-700",
    draft: "bg-amber-100/80 text-amber-700",
    archived: "bg-ash-100 text-navy-400 shadow-neu-inset-sm",
  };
  return (
    <span className={`neu-badge ${map[status] ?? "bg-ash-100 text-navy-400"}`}>{status}</span>
  );
}

function SubmissionStatusPill({ status }: { status: string }) {
  const map: Record<string, { className: string; label: string }> = {
    new: { className: "bg-ceyteq-100/90 text-ceyteq-700", label: "New" },
    reviewed: { className: "bg-emerald-100/80 text-emerald-700", label: "Reviewed" },
    archived: { className: "bg-ash-100 text-navy-400 shadow-neu-inset-sm", label: "Archived" },
  };
  const item = map[status] ?? { className: "bg-ash-100 text-navy-400", label: status };
  return <span className={`neu-badge ${item.className}`}>{item.label}</span>;
}
