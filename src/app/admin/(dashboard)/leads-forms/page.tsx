import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CreateFormButton } from "@/components/admin/CreateFormButton";
import { AddLeadButton } from "@/components/admin/AddLeadButton";
import { CopyButton } from "@/components/ui/CopyButton";
import { countForms, listForms } from "@/lib/services/forms-service";
import { leadStats, recentLeadRows } from "@/lib/services/leads-service";
import { todaySubmissionCount } from "@/lib/services/submissions-service";
import { LEAD_STATUSES, leadChannelIcon, leadChannelLabel } from "@/lib/leads";
import { moduleByKey } from "@/lib/admin-modules";
import { cn, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads & Forms" };

export default async function LeadsFormsHubPage() {
  const [forms, formCount, leads, today, latestLeads] = await Promise.all([
    listForms(),
    countForms(),
    leadStats(),
    todaySubmissionCount(),
    recentLeadRows(4),
  ]);

  const module = moduleByKey("leads-forms");
  const shareable = forms.find((form) => form.status === "published") ?? forms[0];
  const shareableHref = shareable
    ? `/form/${shareable.slug}`
    : "/form/restaurant-onboarding";

  const conversion =
    leads.total > 0 ? Math.round(((leads.byStatus.won ?? 0) / leads.total) * 100) : 0;

  const counts: Record<string, number> = {
    clients: leads.total,
    leads: leads.newCount,
    forms: formCount,
    responses: today,
  };

  const stats = [
    {
      label: "Total forms",
      value: formCount,
      sub: `${forms.filter((form) => form.status === "published").length} published · ${forms.length - forms.filter((form) => form.status === "published").length} draft`,
      icon: "forms" as const,
      href: "/admin/forms",
    },
    {
      label: "New leads",
      value: leads.newCount,
      sub: leads.newCount ? "waiting for a first reply" : "inbox clear",
      icon: "mail" as const,
      href: "/admin/leads",
      highlight: leads.newCount > 0,
    },
    {
      label: "Today's submissions",
      value: today,
      sub: `${leads.total} enquiries all time`,
      icon: "inbox" as const,
      href: "/admin/submissions",
    },
    {
      label: "Conversion",
      value: `${conversion}%`,
      sub: `${leads.byStatus.won ?? 0} won · ${leads.byStatus.qualified ?? 0} qualified`,
      icon: "chart" as const,
      href: "/admin/leads",
      dark: true,
    },
  ];

  const pipeline = LEAD_STATUSES.map((status) => ({
    ...status,
    count:
      status.value === "new"
        ? leads.newCount
        : leads.byStatus[status.value] ?? 0,
  }));
  const pipelineMax = Math.max(1, ...pipeline.map((column) => column.count));

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8">
        <span className="glow-blob -right-8 -top-12 h-40 w-40 bg-ash-50" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
              <span className="neon-dot" />
              {module.label} · live module
            </p>
            <h1 className="mt-2 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[30px]">
              Clients, enquiries &amp; forms
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-navy-400">
              {module.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <CreateFormButton template="restaurant" label="Create form" variant="primary" icon="plus" />
            <CopyButton
              value={shareableHref}
              label="Copy public form link"
              copiedLabel="Link copied"
              className="!py-2.5 !text-[12.5px]"
            />
            <AddLeadButton />
          </div>
        </div>
      </header>

      {/* Key metrics: raised ash cards, inset wells inside, one dark panel */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Glyph = Icon[stat.icon];
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={cn(
                "neu-click-card group relative overflow-hidden rounded-neu p-5",
                stat.dark ? "neu-dark" : "neu-3d",
              )}
            >
              {stat.dark ? <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-ceyteq-neon/25" /> : null}
              <div className="relative flex items-start justify-between gap-3">
                <p
                  className={cn(
                    "text-[10.5px] font-bold uppercase tracking-[0.14em]",
                    stat.dark ? "text-white/60" : "text-navy-300",
                  )}
                >
                  {stat.label}
                </p>
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl",
                    stat.dark
                      ? "bg-white/[0.06] text-ceyteq-neon shadow-[inset_0_0_16px_rgba(61,165,255,0.25),0_0_0_1px_rgba(61,165,255,0.3)]"
                      : "neu-inset-card",
                    !stat.dark && (stat.highlight ? "text-ceyteq-500" : "text-navy-300"),
                  )}
                >
                  <Glyph size={16} />
                </span>
              </div>

              <div
                className={cn(
                  "relative mt-4 rounded-2xl px-3.5 py-3",
                  stat.dark ? "neu-dark-inset" : "neu-well",
                )}
              >
                <p
                  className={cn(
                    "font-display text-[28px] font-semibold leading-none tracking-[-0.02em]",
                    stat.dark ? "text-white" : "stat-value",
                  )}
                >
                  {stat.value}
                </p>
                <p
                  className={cn(
                    "mt-1.5 truncate text-[11px] font-semibold",
                    stat.dark ? "text-white/60" : "text-navy-300",
                  )}
                >
                  {stat.sub}
                </p>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Module pages */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-[16px] font-bold text-navy-700">Inside this module</h2>
            <p className="text-[12px] font-medium text-navy-300">
              Four working pages, one shared data model.
            </p>
          </div>
          <Link href="/admin" className="neu-btn-ghost !px-2.5 !py-1.5 !text-[11.5px]">
            Control centre
            <Icon.chevronRight size={13} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {module.children.map((child) => {
            const Glyph = Icon[child.icon];
            const badge = counts[child.key] ?? 0;
            return (
              <Link
                key={child.key}
                href={child.href}
                className="neu-click-card neu group relative flex flex-col overflow-hidden rounded-neu p-5"
              >
                <span className="glow-blob -right-8 -top-8 h-24 w-24 bg-ash-50" />
                <div className="relative flex items-start justify-between">
                  <span className="neu-inset-card grid h-11 w-11 place-items-center text-ceyteq-500">
                    <Glyph size={19} />
                  </span>
                  {child.badge ? (
                    <span className="neu-badge bg-ash-100 text-[9.5px] text-navy-400 shadow-neu-inset-sm">
                      {badge} live
                    </span>
                  ) : null}
                </div>
                <h3 className="relative mt-3.5 text-[14px] font-bold text-navy-700">{child.label}</h3>
                <p className="relative mt-1.5 flex-1 text-[12px] leading-relaxed text-navy-400">
                  {child.description}
                </p>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                  Open
                  <Icon.arrowRight
                    size={12}
                    className="transition-transform duration-250 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        {/* Pipeline snapshot */}
        <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-navy-700">Pipeline snapshot</h2>
              <p className="text-[12px] font-medium text-navy-300">
                {leads.total} leads by stage
              </p>
            </div>
            <Link href="/admin/leads" className="neu-btn !px-3.5 !py-2 !text-[11.5px]">
              Open pipeline
              <Icon.arrowRight size={12} />
            </Link>
          </div>

          <div className="neu-well mt-4 space-y-3 rounded-3xl p-4">
            {pipeline.map((stage) => (
              <div key={stage.value} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-navy-400">
                  {stage.label}
                </span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ash-100 shadow-neu-inset-sm">
                  <span
                    className="block h-full rounded-pill bg-[linear-gradient(90deg,#2F6BFF,#3DA5FF)] shadow-[0_0_12px_rgba(61,165,255,0.45)]"
                    style={{ width: `${Math.max((stage.count / pipelineMax) * 100, stage.count ? 6 : 0)}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-[12px] font-bold text-navy-600">
                  {stage.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/leads?status=new" className="neu-chip !py-1.5 !text-[11px]">
              Reply to new
            </Link>
            <Link href="/admin/leads?status=won" className="neu-chip !py-1.5 !text-[11px]">
              Won deals
            </Link>
            <a href="/api/admin/leads/export" className="neu-chip !py-1.5 !text-[11px]">
              <Icon.download size={12} className="text-ceyteq-500" />
              Export CSV
            </a>
          </div>
        </section>

        {/* Latest enquiries */}
        <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-bold text-navy-700">Latest enquiries</h2>
              <p className="text-[12px] font-medium text-navy-300">Newest first</p>
            </div>
            <Link href="/admin/leads" className="neu-btn-ghost !px-2.5 !py-1.5 !text-[11.5px]">
              All leads
              <Icon.chevronRight size={13} />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {latestLeads.length === 0 ? (
              <p className="neu-well rounded-2xl px-4 py-8 text-center text-[12.5px] font-semibold text-navy-300">
                No enquiries yet — add one manually or share the website contact form.
              </p>
            ) : (
              latestLeads.map((lead) => {
                const Glyph = Icon[leadChannelIcon(lead.channel)];
                return (
                  <div key={lead.id} className="neu-inset-card flex items-start gap-3 rounded-2xl p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ash-100 text-ceyteq-500 shadow-neu-inset-sm">
                      <Glyph size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-navy-600">{lead.name}</p>
                      <p className="truncate text-[11px] font-medium text-navy-300">
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
      </div>
    </div>
  );
}
