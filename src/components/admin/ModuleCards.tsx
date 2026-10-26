import Link from "next/link";
import { Icon } from "@/components/icons";
import { ADMIN_MODULES, type AdminBadgeCounts, type AdminModule } from "@/lib/admin-modules";
import { cn } from "@/lib/utils";

/**
 * Module tiles for the control-centre overview. Rendered straight from
 * `ADMIN_MODULES`, so a new registry entry shows up here with no edits.
 *
 * The first live module (Leads & Forms) is promoted to a dark navy panel with a
 * radium glow; the rest stay raised ash.
 */
export function ModuleCards({
  counts = {},
  modules = ADMIN_MODULES,
}: {
  counts?: AdminBadgeCounts;
  modules?: AdminModule[];
}) {
  return (
    <section aria-labelledby="modules-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h2 id="modules-heading" className="text-[16px] font-bold text-navy-700">
            Systems
          </h2>
          <p className="text-[12px] font-medium text-navy-300">
            Every module in the control centre — live and planned.
          </p>
        </div>
        <Link href="/admin/more-systems" className="neu-btn-ghost !px-2.5 !py-1.5 !text-[11.5px]">
          Manage
          <Icon.chevronRight size={13} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Glyph = Icon[module.icon];
          const soon = module.status === "soon";
          /* The first multi-page module gets the dark navy treatment. */
          const featured = module.key === "leads-forms";

          return (
            <Link
              key={module.key}
              href={module.href}
              className={cn(
                "neu-click-card group relative flex flex-col overflow-hidden rounded-neu p-5 sm:p-6",
                featured ? "neu-dark" : "neu-3d",
              )}
            >
              <span
                className={cn(
                  "glow-blob h-28 w-28",
                  featured ? "-right-8 -top-8 bg-ceyteq-neon/30" : "-right-10 -top-10 bg-ash-50",
                )}
              />

              <div className="relative flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-2xl",
                    featured
                      ? "bg-white/[0.06] text-ceyteq-neon shadow-[inset_0_0_18px_rgba(0, 210, 255,0.25),0_0_0_1px_rgba(0, 210, 255,0.35)]"
                      : "neu-inset-card text-ceyteq-500",
                  )}
                >
                  <Glyph size={20} />
                </span>
                <span
                  className={cn(
                    "neu-badge !px-2.5 !py-1 !text-[9.5px]",
                    soon
                      ? "bg-ash-100 text-navy-300 shadow-neu-inset-sm"
                      : featured
                        ? "bg-ceyteq-neon/15 text-ceyteq-neon shadow-[0_0_14px_rgba(0, 210, 255,0.25)]"
                        : "bg-ash-100 text-navy-400 shadow-neu-inset-sm",
                  )}
                >
                  {soon ? "Soon" : module.tag ?? "Live"}
                </span>
              </div>

              <h3
                className={cn(
                  "relative mt-4 text-[16px] font-bold",
                  featured ? "text-white" : "text-navy-700",
                )}
              >
                {module.label}
              </h3>
              <p
                className={cn(
                  "relative mt-1.5 text-[12.5px] leading-relaxed",
                  featured ? "text-white/70" : "text-navy-400",
                )}
              >
                {module.description}
              </p>

              {module.children.length > 0 ? (
                <div
                  className={cn(
                    "relative mt-4 flex flex-wrap gap-1.5 rounded-2xl p-2.5",
                    featured ? "neu-dark-inset" : "neu-well",
                  )}
                >
                  {module.children.map((child) => {
                    const badge = child.badge ? counts[child.badge] ?? 0 : 0;
                    return (
                      <span
                        key={child.key}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[10.5px] font-bold",
                          featured
                            ? "bg-white/10 text-white/85"
                            : "bg-ash-100 text-navy-400 shadow-neu-inset-sm",
                        )}
                      >
                        {child.label}
                        {badge > 0 ? <span className="text-ceyteq-neon">{badge}</span> : null}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <span
                className={cn(
                  "relative mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]",
                  featured ? "text-ceyteq-neon" : "text-navy-300",
                )}
              >
                {soon ? "Preview the plan" : "Open module"}
                <Icon.arrowRight
                  size={13}
                  className="transition-transform duration-250 group-hover:translate-x-1"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
