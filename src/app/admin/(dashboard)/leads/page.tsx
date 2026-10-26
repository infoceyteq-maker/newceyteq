import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { LeadActions } from "@/components/admin/LeadActions";
import { LeadFilters } from "@/components/admin/LeadFilters";
import { leadStats, listLeads } from "@/lib/services/leads-service";
import {
  LEAD_CHANNELS,
  LEAD_STATUSES,
  leadChannelIcon,
  leadChannelLabel,
  leadSourceLabel,
} from "@/lib/leads";
import { formatDateTime, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads & Inquiries" };

type SearchParams = Promise<{ status?: string; source?: string; channel?: string; q?: string }>;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-ceyteq-100/90 text-ceyteq-700",
  contacted: "bg-sky-100/85 text-sky-700",
  qualified: "bg-emerald-100/85 text-emerald-700",
  won: "bg-emerald-200/80 text-emerald-800",
  archived: "bg-slate-200/80 text-slate-600",
};

export default async function LeadsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status, source, channel, q } = await searchParams;

  const [leads, stats] = await Promise.all([
    listLeads({ status, source, channel, query: q, take: 300 }),
    leadStats(),
  ]);

  const exportQuery = new URLSearchParams();
  if (status) exportQuery.set("status", status);
  if (source) exportQuery.set("source", source);
  if (channel) exportQuery.set("channel", channel);

  const counts: Record<string, number> = { total: stats.total, ...stats.byStatus };
  const socialCount = LEAD_CHANNELS.reduce(
    (total, option) => total + (option.source === "social" ? stats.byChannel[option.value] ?? 0 : 0),
    0,
  );

  return (
    <div className="space-y-5">
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8">
        <div className="glow-blob -right-8 -top-12 h-40 w-40 bg-ceyteq-neon/25" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
              <span className="neon-dot" />
              Leads &amp; inquiries
            </p>
            <h1 className="mt-2 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[30px]">
              Social media &amp; email pipeline
            </h1>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-navy-400">
              Every enquiry that arrives from Facebook, Instagram, TikTok, WhatsApp, email or the
              website form — tracked from first contact to won.
            </p>
          </div>
          <a
            href={`/api/admin/leads/export${exportQuery.toString() ? `?${exportQuery.toString()}` : ""}`}
            className="neu-btn !px-4 !py-2.5 !text-[12.5px]"
          >
            <Icon.download size={15} className="text-ceyteq-500" />
            Export CSV
          </a>
        </div>
      </header>

      {/* Pipeline stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total leads", value: stats.total, sub: "all time", icon: "users" as const },
          {
            label: "New",
            value: stats.newCount,
            sub: stats.newCount ? "needs a reply" : "inbox clear",
            icon: "mail" as const,
            highlight: stats.newCount > 0,
          },
          { label: "From social", value: socialCount, sub: "social platforms", icon: "instagram" as const },
          {
            label: "Won",
            value: stats.byStatus.won ?? 0,
            sub: `${stats.byStatus.qualified ?? 0} qualified`,
            icon: "check" as const,
          },
        ].map((card) => {
          const Glyph = Icon[card.icon];
          return (
            <div key={card.label} className="neu-3d rounded-neu p-5">
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
              <p className="mt-3 font-display text-[30px] font-semibold leading-none text-navy-700">
                {card.value}
              </p>
              <p className="mt-1.5 truncate text-[11.5px] font-semibold text-navy-300">{card.sub}</p>
            </div>
          );
        })}
      </section>

      <LeadFilters counts={counts} />

      {leads.length === 0 ? (
        <div className="neu-raised grid place-items-center rounded-neu-lg px-6 py-16 text-center">
          <span className="neu-orb h-16 w-16 text-navy-300">
            <Icon.mail size={24} />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-navy-700">No leads yet</h2>
          <p className="mt-2 max-w-sm text-[13.5px] text-navy-400">
            {q || status || source
              ? "No enquiries match these filters. Try clearing them."
              : "Enquiries from the website contact form land here instantly. Share your profile links to start the flow."}
          </p>
          <Link href="/#contact" className="neu-btn mt-6 !py-2.5 !text-[13px]">
            <Icon.external size={15} className="text-ceyteq-500" />
            View the public contact form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => {
            const Glyph = Icon[leadChannelIcon(lead.channel)];
            return (
              <article key={lead.id} className="neu-raised rounded-neu-lg p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="neu-orb h-9 w-9 shrink-0 text-ceyteq-500">
                        <Glyph size={15} />
                      </span>
                      <h2 className="text-[15.5px] font-bold text-navy-700">{lead.name}</h2>
                      {lead.company ? (
                        <span className="text-[12px] font-semibold text-navy-300">
                          · {lead.company}
                        </span>
                      ) : null}
                      <span
                        className={`neu-badge ${STATUS_STYLES[lead.status] ?? "bg-white/70 text-navy-400"}`}
                      >
                        {LEAD_STATUSES.find((option) => option.value === lead.status)?.label ??
                          lead.status}
                      </span>
                      <span className="neu-badge bg-white/70 text-navy-400">
                        {leadChannelLabel(lead.channel)}
                      </span>
                    </div>

                    <p className="mt-3 max-w-3xl whitespace-pre-line text-[13px] leading-relaxed text-navy-500">
                      {lead.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] font-semibold text-navy-300">
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-ceyteq-600">
                        <Icon.mail size={12} /> {lead.email}
                      </a>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-ceyteq-600">
                          <Icon.phone size={12} /> {lead.phone}
                        </a>
                      ) : null}
                      <span className="flex items-center gap-1.5">
                        <Icon.globe size={12} /> {leadSourceLabel(lead.source)}
                      </span>
                      <span className="flex items-center gap-1.5" title={formatDateTime(lead.createdAt)}>
                        <Icon.clock size={12} /> {relativeTime(lead.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start">
                    <LeadActions id={lead.id} status={lead.status} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
