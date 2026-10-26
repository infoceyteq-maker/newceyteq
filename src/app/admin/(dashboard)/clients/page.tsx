import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ClientFilters } from "@/components/admin/ClientFilters";
import { clientStats, listClients } from "@/lib/services/clients-service";
import { displayValue, formatDateTime, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Restaurant Clients" };

type SearchParams = Promise<{ status?: string; q?: string }>;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-ceyteq-100/90 text-ceyteq-700",
  reviewed: "bg-emerald-100/85 text-emerald-700",
  archived: "bg-slate-200/80 text-slate-600",
};

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const { status, q } = await searchParams;

  // Pull the unfiltered set once so the stat strip and status counts stay stable.
  const allClients = await listClients({ take: 500 });
  const clients = await listClients({ status, query: q, take: 500 });
  const stats = clientStats(allClients);

  const counts = {
    all: allClients.length,
    new: allClients.filter((client) => client.status === "new").length,
    reviewed: allClients.filter((client) => client.status === "reviewed").length,
    archived: allClients.filter((client) => client.status === "archived").length,
  };

  return (
    <div className="space-y-5">
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8">
        <div className="glow-blob -right-8 -top-12 h-40 w-40 bg-ceyteq-200/60" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
              <span className="neon-dot" />
              Clients
            </p>
            <h1 className="mt-2 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[30px]">
              Restaurant clients
            </h1>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-navy-400">
              Every venue that completed the onboarding form, with its owner contacts, social links
              and brand palette in one place.
            </p>
          </div>
          <Link href="/form/restaurant-onboarding" target="_blank" className="neu-btn !px-4 !py-2.5 !text-[12.5px]">
            <Icon.external size={15} className="text-ceyteq-500" />
            Open onboarding form
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Clients", value: stats.total, sub: "onboarded venues", icon: "store" as const },
          { label: "With social links", value: stats.withLinks, sub: "profiles supplied", icon: "link" as const },
          { label: "Brand palettes", value: stats.withPalette, sub: "colours chosen", icon: "palette" as const },
          { label: "Average completeness", value: `${stats.average}%`, sub: `${stats.cities} cities`, icon: "chart" as const },
        ].map((card) => {
          const Glyph = Icon[card.icon];
          return (
            <div key={card.label} className="neu-3d rounded-neu p-5">
              <div className="flex items-start justify-between">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                  {card.label}
                </p>
                <span className="neu-orb h-9 w-9 text-ceyteq-500">
                  <Glyph size={16} />
                </span>
              </div>
              <p className="mt-3 font-display text-[28px] font-semibold leading-none text-navy-700">
                {card.value}
              </p>
              <p className="mt-1.5 truncate text-[11.5px] font-semibold text-navy-300">{card.sub}</p>
            </div>
          );
        })}
      </section>

      <ClientFilters counts={counts} />

      {clients.length === 0 ? (
        <div className="neu-raised grid place-items-center rounded-neu-lg px-6 py-16 text-center">
          <span className="neu-orb h-16 w-16 text-navy-300">
            <Icon.store size={24} />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-navy-700">No clients yet</h2>
          <p className="mt-2 max-w-sm text-[13.5px] text-navy-400">
            {q || status
              ? "No clients match these filters. Try clearing them."
              : "Share the onboarding link with your first restaurant — the details they submit appear here instantly."}
          </p>
          <Link href={`/form/restaurant-onboarding`} className="neu-btn mt-6 !py-2.5 !text-[13px]">
            <Icon.external size={15} className="text-ceyteq-500" />
            Open the onboarding form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {clients.map((client, index) => (
            <article
              key={client.id}
              className="neu-raised animate-fade-up rounded-neu-lg p-5 sm:p-6"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[16.5px] font-bold text-navy-700">
                      {client.restaurantName || "Untitled restaurant"}
                    </h2>
                    <span
                      className={`neu-badge ${STATUS_STYLES[client.status] ?? "bg-white/70 text-navy-400"}`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[12px] font-semibold text-navy-300">
                    {[client.locationName, client.nearbyCity].filter(Boolean).join(" · ") ||
                      "Location not supplied"}
                  </p>
                </div>
                <span className="neu-orb h-11 w-11 shrink-0 font-display text-[13px] font-bold text-ceyteq-600">
                  {client.completeness}%
                </span>
              </div>

              <dl className="mt-4 grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                {[
                  { label: "Owner", value: client.ownerName },
                  { label: "Restaurant email", value: client.restaurantEmail },
                  { label: "Restaurant phone", value: client.restaurantPhone },
                  { label: "Owner phone", value: client.ownerPhone },
                ].map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="text-[9.5px] font-bold uppercase tracking-[0.13em] text-navy-300">
                      {row.label}
                    </dt>
                    <dd className="truncate text-[12.5px] font-semibold text-navy-600">
                      {row.value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {client.themeColors.length > 0 ? (
                  client.themeColors.slice(0, 6).map((color) => (
                    <span
                      key={color}
                      title={color}
                      className="h-6 w-6 rounded-lg border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_6px_rgba(163,177,198,0.5)]"
                      style={{ backgroundColor: color }}
                    />
                  ))
                ) : (
                  <span className="text-[11px] font-semibold text-navy-300">No palette chosen</span>
                )}
                <span className="ml-auto neu-chip !py-1 !text-[10.5px]">
                  <Icon.link size={11} className="text-ceyteq-500" />
                  {client.links.length} link{client.links.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="neu-divider my-4" />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-300"
                  title={formatDateTime(client.receivedAt)}
                >
                  <Icon.clock size={12} /> {relativeTime(client.receivedAt)} · {client.reference}
                </p>
                <div className="flex items-center gap-2">
                  {client.links[0] ? (
                    <a
                      href={client.links[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neu-btn !px-3 !py-1.5 !text-[11.5px]"
                    >
                      <Icon.external size={12} className="text-ceyteq-500" />
                      {displayValue(client.links[0].platform)}
                    </a>
                  ) : null}
                  <Link
                    href={`/admin/submissions/${client.id}`}
                    className="neu-btn-primary neu-btn !px-3 !py-1.5 !text-[11.5px]"
                  >
                    Open record
                    <Icon.arrowRight size={12} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
