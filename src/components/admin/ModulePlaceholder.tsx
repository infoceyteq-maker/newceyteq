import Link from "next/link";
import { Icon } from "@/components/icons";
import type { AdminModule } from "@/lib/admin-modules";

/**
 * Shared "Coming soon" shell for registry modules with `status: "soon"`.
 *
 * Drop-in page:
 *
 *   const module = moduleByKey("web-studio");
 *   export default function Page() { return <ModulePlaceholder module={module} />; }
 */
export function ModulePlaceholder({
  module,
  planned = [],
}: {
  module: AdminModule;
  planned?: Array<{ title: string; copy: string; icon?: keyof typeof Icon }>;
}) {
  const Glyph = Icon[module.icon];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">
            <span className="neon-dot" />
            Module · {module.label}
          </p>
          <h1 className="mt-1.5 text-[24px] font-semibold leading-tight text-navy-700 sm:text-[28px]">
            {module.label}
          </h1>
        </div>
        <Link href="/admin" className="neu-btn !px-4 !py-2 !text-[12px]">
          <Icon.arrowLeft size={14} className="text-navy-400" />
          Control centre
        </Link>
      </header>

      <section className="neu-dark relative overflow-hidden rounded-neu-lg px-6 py-9 sm:px-10 sm:py-12">
        <span className="glow-blob -right-10 -top-12 h-52 w-52 bg-ceyteq-neon/25" />
        <span className="glow-blob -bottom-16 left-0 h-44 w-44 bg-ceyteq-500/20" />

        <div className="relative max-w-2xl">
          <span className="neu-dark-inset inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ceyteq-neon">
            <span className="neon-dot" />
            Coming soon
          </span>

          <div className="mt-6 flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-ceyteq-neon shadow-[inset_0_0_20px_rgba(0, 210, 255,0.25),0_0_0_1px_rgba(0, 210, 255,0.35)]">
              <Glyph size={24} />
            </span>
            <div>
              <h2 className="text-[22px] font-semibold leading-tight text-white sm:text-[26px]">
                {module.label} is being built
              </h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">{module.description}</p>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-[12.5px] leading-relaxed text-white/55">
            This module is already registered in the control-centre navigation. Everything else keeps
            working while it is being built — Leads &amp; Forms is fully live.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/admin/leads-forms" className="neu-btn-primary neu-btn !px-5 !py-2.5 !text-[12.5px]">
              Go to Leads &amp; Forms
              <Icon.arrowRight size={14} />
            </Link>
            <Link
              href="/admin/more-systems"
              className="neu-btn inline-flex items-center gap-2 !px-5 !py-2.5 !text-[12.5px] font-semibold text-navy-700"
            >
              <Icon.stack size={14} />
              See the roadmap
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {(planned.length > 0
          ? planned
          : [
              { title: "Scoped", copy: "Requirements captured with the Ceyteq team.", icon: "notes" as const },
              { title: "In design", copy: "Neumorphic screens and data model being drafted.", icon: "palette" as const },
              { title: "Ready to plug in", copy: "Adds itself to the sidebar on release.", icon: "sparkles" as const },
            ]
        ).map((item, index) => {
          const ItemGlyph = Icon[item.icon ?? "sparkles"];
          return (
            <article key={item.title} className="neu-raised rounded-neu p-5">
              <div className="flex items-center justify-between">
                <span className="neu-inset-card grid h-10 w-10 place-items-center text-ceyteq-500">
                  <ItemGlyph size={17} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-[14px] font-bold text-navy-700">{item.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-navy-400">{item.copy}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
