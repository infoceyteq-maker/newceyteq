import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { SOON_MODULES, UPCOMING_SYSTEMS, ADMIN_MODULES } from "@/lib/admin-modules";

export const metadata: Metadata = { title: "More Systems" };

const SNIPPET = `{
  key: "new-system",
  label: "New System",
  icon: "layers",
  href: "/admin/new-system",
  status: "soon",
  description: "What the module does.",
  children: [],
}`;

export default function MoreSystemsPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">
            <span className="neon-dot" />
            Extensible control centre
          </p>
          <h1 className="mt-1.5 text-[24px] font-semibold leading-tight text-navy-700 sm:text-[28px]">
            More systems
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-navy-400">
            Reserved slots for the next Ceyteq systems. Every tile on this page — and every item in
            the sidebar — comes from one registry file, so adding a system never touches the shell.
          </p>
        </div>
        <span className="neu-chip !py-1.5 !text-[11px]">
          {ADMIN_MODULES.length} modules · {SOON_MODULES.length} in build
        </span>
      </header>

      {/* Registered placeholder modules */}
      <section className="space-y-3">
        <h2 className="px-1 text-[15px] font-bold text-navy-700">Registered placeholders</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SOON_MODULES.map((module) => {
            const Glyph = Icon[module.icon];
            return (
              <Link
                key={module.key}
                href={module.href}
                className="neu-3d neu-click-card group relative overflow-hidden rounded-neu p-5"
              >
                <span className="glow-blob -right-8 -top-10 h-32 w-32 bg-ash-50" />
                <div className="relative flex items-start justify-between">
                  <span className="neu-inset-card grid h-11 w-11 place-items-center text-ceyteq-500">
                    <Glyph size={19} />
                  </span>
                  <span className="neu-badge bg-ash-100 text-[9.5px] text-navy-300 shadow-neu-inset-sm">
                    Coming soon
                  </span>
                </div>
                <h3 className="relative mt-4 text-[15px] font-bold text-navy-700">{module.label}</h3>
                <p className="relative mt-1.5 text-[12px] leading-relaxed text-navy-400">
                  {module.description}
                </p>
                <span className="relative mt-4 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                  Preview
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

      {/* Reserved slots for future systems */}
      <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-bold text-navy-700">Reserved slots</h2>
            <p className="text-[12px] font-medium text-navy-300">
              Data-only placeholders — promote one to a live module when it is ready.
            </p>
          </div>
          <span className="neu-badge bg-ash-100 text-[9.5px] text-navy-300 shadow-neu-inset-sm">
            {UPCOMING_SYSTEMS.length} queued
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {UPCOMING_SYSTEMS.map((slot) => {
            const Glyph = Icon[slot.icon];
            return (
              <div key={slot.key} className="neu-well flex items-start gap-3 rounded-2xl p-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ash-100 text-navy-300 shadow-neu-inset-sm">
                  <Glyph size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold text-navy-600">{slot.label}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-navy-300">
                    {slot.description}
                  </p>
                </div>
                <span className="ml-auto shrink-0 text-[9.5px] font-bold uppercase tracking-[0.12em] text-navy-300">
                  Slot
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* How to add a module */}
      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="neu-dark relative overflow-hidden rounded-neu-lg p-5 sm:p-6">
          <span className="glow-blob -right-10 -top-12 h-40 w-40 bg-ceyteq-neon/25" />
          <div className="relative">
            <h2 className="text-[15px] font-bold text-white">One entry, one folder</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">
              Add the module to <code className="text-ceyteq-neon">src/lib/admin-modules.ts</code> and
              create its page folder. The sidebar, mobile nav, dashboard cards and this page update
              automatically.
            </p>
            <pre className="neu-dark-inset mt-4 overflow-x-auto rounded-2xl p-3.5 text-[11px] leading-relaxed text-white/75">
              <code>{SNIPPET}</code>
            </pre>
          </div>
        </div>

        <div className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-navy-700">What is live today</h2>
          <div className="mt-3 space-y-2">
            {ADMIN_MODULES.filter((module) => module.status === "live").map((module) => {
              const Glyph = Icon[module.icon];
              return (
                <Link
                  key={module.key}
                  href={module.href}
                  className="neu-inset-card flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition-transform duration-250 hover:-translate-y-0.5"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-ash-100 text-ceyteq-500 shadow-neu-inset-sm">
                    <Glyph size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-bold text-navy-600">
                      {module.label}
                    </span>
                    <span className="block truncate text-[11px] font-medium text-navy-300">
                      {module.children.length} pages
                    </span>
                  </span>
                  <Icon.chevronRight size={13} className="text-navy-300" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
