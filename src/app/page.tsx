import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ContactSection } from "@/components/site/ContactSection";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CopyButton } from "@/components/ui/CopyButton";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/auth";
import { DEFAULT_PALETTE } from "@/lib/types";
import { countForms, getFormBySlug } from "@/lib/services/forms-service";
import { countSubmissions } from "@/lib/services/submissions-service";
import { requestOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

const FEATURED_SLUG = "restaurant-onboarding";

async function loadHomeData() {
  try {
    const [formCount, submissionCount, featured] = await Promise.all([
      countForms({ status: "published" }),
      countSubmissions(),
      getFormBySlug(FEATURED_SLUG),
    ]);
    return { formCount, submissionCount, featured };
  } catch {
    // The landing page must still render before the database is provisioned.
    return { formCount: 0, submissionCount: 0, featured: null };
  }
}

export default async function HomePage() {
  const [user, data, origin] = await Promise.all([getSessionUser(), loadHomeData(), requestOrigin()]);
  const featured = data.featured;
  const featuredUrl = `${origin}/form/${featured?.slug ?? FEATURED_SLUG}`;
  const sectionCount = featured?.sections.length ?? 5;
  const fieldCount =
    featured?.sections.reduce((total, section) => total + section.fields.length, 0) ?? 18;

  return (
    <div className="relative min-h-screen bg-ash-300">
      <SiteHeader authenticated={!!user} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ---------------------------------------------------------------- hero */}
        <section className="relative pb-4 pt-10 sm:pt-14">
          <div className="glow-blob left-1/2 top-2 h-48 w-[30rem] -translate-x-1/2 bg-ash-50" />
          <div className="glow-blob -left-24 top-24 h-56 w-56 bg-ash-50" />

          <div className="relative mx-auto max-w-3xl text-center animate-fade-up">
            <div className="neu-chip neu-chip-inset mx-auto !py-2.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[linear-gradient(145deg,#0072CE,#00D2FF)] text-white shadow-[0_0_14px_rgba(0, 210, 255,0.6)]">
                <Icon.bolt size={12} />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy-400">
                Ceyteq Digital Race · 2026
              </span>
            </div>

            <h1 className="mt-6 font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-navy-700 sm:text-[52px] lg:text-[60px]">
              One soft interface for{" "}
              <span className="text-gradient-blue">every restaurant</span> in the digital race.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-navy-400 sm:text-[16px]">
              Ceyteq builds your brand theme, listings and storefront from a single onboarding
              form. Admins design the form in the dashboard — every answer lands back in the same
              place, ready to launch.
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href={`/form/${featured?.slug ?? FEATURED_SLUG}`}
                className="neu-btn-primary neu-btn group !px-7 !py-3.5"
              >
                Start restaurant onboarding
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20 transition-transform group-hover:translate-x-0.5">
                  <Icon.arrowRight size={15} />
                </span>
              </Link>
              <Link href={user ? "/admin" : "/admin/login"} className="neu-btn !px-6 !py-3.5">
                <Icon.layers size={16} className="text-ceyteq-500" />
                {user ? "Open dashboard" : "Admin dashboard"}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3.5 sm:mt-12 sm:grid-cols-4">
            {[
              { label: "Live forms", value: data.formCount, icon: "forms" as const },
              { label: "Submissions", value: data.submissionCount, icon: "inbox" as const },
              { label: "Sections", value: sectionCount, icon: "layers" as const },
              { label: "Fields generated", value: fieldCount, icon: "sparkles" as const },
            ].map((stat) => {
              const Glyph = Icon[stat.icon];
              return (
                <div
                  key={stat.label}
                  className="neu-3d group rounded-2xl px-4 py-4 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="stat-value text-[24px]">{stat.value}</p>
                    <span className="text-ceyteq-500/70 transition-colors group-hover:text-ceyteq-500">
                      <Glyph size={15} />
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-navy-300">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------ platform */}
        <section id="platform" className="scroll-mt-28 py-14 sm:py-20">
          <SectionHeading
            eyebrow="The platform"
            title="A form engine, not a fixed form"
            copy="Administrators compose sections, fields and rules in the dashboard. Each saved definition becomes a live, shareable link — no deploys, no code."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: "layers" as const,
                title: "Compose in the dashboard",
                copy: "Add sections, drag fields into order, set required rules, options and per-field layouts. Publish once, reuse forever.",
                meta: "Builder · schema JSON",
              },
              {
                icon: "link" as const,
                title: "Share a unique link",
                copy: "Every form gets a slug like /form/restaurant-onboarding that renders the saved configuration instantly.",
                meta: "Public · no login required",
              },
              {
                icon: "inbox" as const,
                title: "Capture & triage",
                copy: "Submissions are validated server-side, stored against the field keys and reviewable with notes and CSV export.",
                meta: "Secure · exportable",
              },
            ].map((card) => {
              const Glyph = Icon[card.icon];
              return (
                <article
                  key={card.title}
                  className="neu-raised neu-click-card group relative overflow-hidden rounded-neu-lg p-6"
                >
                  <span className="glow-blob -right-6 -top-6 h-24 w-24 bg-ash-50 transition-opacity group-hover:opacity-90" />
                  <span className="neu-orb relative grid h-14 w-14 place-items-center text-ceyteq-500">
                    <Glyph size={22} />
                  </span>
                  <h3 className="relative mt-5 text-[17px] font-bold text-navy-700">{card.title}</h3>
                  <p className="relative mt-2 text-[13.5px] leading-relaxed text-navy-400">{card.copy}</p>
                  <p className="relative mt-5 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-navy-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-ceyteq-500" />
                    {card.meta}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* --------------------------------------------------------------- forms */}
        <section id="forms" className="scroll-mt-28 pb-14 sm:pb-20">
          <SectionHeading
            eyebrow="Generated link"
            title={featured?.title ?? "Restaurant Onboarding"}
            copy={
              featured?.description ??
              "Restaurant details, owner contacts, social links, brand colours and notes — rendered automatically from the backend configuration."
            }
          />

          <div className="neu-raised mt-9 rounded-neu-lg p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">
                  Public link
                </p>
                <div className="neu-sunken mt-2 flex items-center gap-2 rounded-2xl px-3.5 py-3">
                  <Icon.link size={15} className="shrink-0 text-navy-300" />
                  <code className="flex-1 truncate text-[12.5px] font-semibold text-navy-500">
                    {featuredUrl.replace(/^https?:\/\//, "")}
                  </code>
                  <CopyButton value={featuredUrl} label="Copy" variant="ghost" compact />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px] font-semibold text-navy-300">
                  <span className="flex items-center gap-1.5">
                    <Icon.layers size={12} className="text-ceyteq-500" />
                    {sectionCount} sections
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon.forms size={12} className="text-ceyteq-500" />
                    {fieldCount} generated fields
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {featured?.status === "published" ? "Accepting submissions" : "Awaiting publication"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Link
                  href={`/form/${featured?.slug ?? FEATURED_SLUG}`}
                  className="neu-btn-dark neu-btn !px-6 !py-3"
                >
                  Open live form
                  <Icon.external size={15} />
                </Link>
                {user ? (
                  <Link href={`/admin/forms/${featured?.id ?? ""}`} className="neu-btn !px-5 !py-3">
                    <Icon.settings size={15} className="text-ceyteq-500" />
                    Edit configuration
                  </Link>
                ) : (
                  <Link href="/admin/login" className="neu-btn !px-5 !py-3">
                    <Icon.settings size={15} className="text-ceyteq-500" />
                    Configure in dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="neu-divider my-6" />

            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">
              Sections in this form
            </p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(featured?.sections ?? []).map((section, index) => (
                <li key={section.id} className="neu flex items-center gap-3 rounded-2xl p-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,#f8fafd,#e6ebf3)] text-ceyteq-500 shadow-neu-inset-sm">
                    <SectionIcon name={section.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-navy-600">{section.title}</p>
                    <p className="text-[11px] font-medium text-navy-300">
                      {section.fields.length} fields ·{" "}
                      {section.fields.filter((field) => field.required).length} required
                    </p>
                  </div>
                  <span className="neu-badge shrink-0 bg-ash-100 text-navy-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </li>
              ))}
              {!featured ? (
                <li className="neu col-span-full rounded-2xl p-6 text-center text-[13px] font-semibold text-navy-300">
                  Publish a form in the dashboard and it will appear here.
                </li>
              ) : null}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------------------- themes */}
        <section id="themes" className="scroll-mt-28 pb-14 sm:pb-20">
          <SectionHeading
            eyebrow="Brand themes"
            title="Ten colours. Five choices. One identity."
            copy="The theme field is a generated colour-multi picker with server-side limits, so every venue selects a palette the brand team can honour."
          />

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DEFAULT_PALETTE.map((colour, index) => (
              <div
                key={colour.value}
                className="neu group relative overflow-hidden rounded-neu p-4 transition-transform hover:-translate-y-1"
              >
                <span
                  className="block h-20 w-full rounded-2xl ring-1 ring-white/60"
                  style={{
                    background: `linear-gradient(150deg, ${colour.swatch}, ${shade(colour.swatch ?? "#0072CE")})`,
                    boxShadow: `inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -8px 16px rgba(0,0,0,0.18), 0 10px 20px -12px ${colour.swatch}`,
                  }}
                />
                <p className="mt-3 text-[12.5px] font-bold text-navy-600">{colour.label}</p>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-navy-300">
                  {colour.swatch}
                </p>
                {index === 0 ? (
                  <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-ash-50 text-ceyteq-500 shadow-sm">
                    <Icon.check size={12} strokeWidth={3} />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------- how it works */}
        <section id="how" className="scroll-mt-28 pb-16 sm:pb-24">
          <SectionHeading
            eyebrow="How it works"
            title="From dashboard to launch in three moves"
            copy="No spreadsheets, no forwarded PDFs. One source of truth for every venue."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Design the form",
                copy: "Start from the restaurant template or a blank canvas, then add sections and fields in the builder.",
              },
              {
                step: "02",
                title: "Publish the link",
                copy: "Flip the status to published and share /form/restaurant-onboarding with your venue.",
              },
              {
                step: "03",
                title: "Review & launch",
                copy: "Every answer arrives validated in the submissions inbox. Mark reviewed, add notes, export CSV.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="neu-raised h-full rounded-neu-lg p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[34px] font-light leading-none text-navy-100">
                      {item.step}
                    </span>
                    <span className="neu-orb h-10 w-10 text-ceyteq-500">
                      <Icon.spark size={16} />
                    </span>
                  </div>
                  <h3 className="mt-4 text-[16.5px] font-bold text-navy-700">{item.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-navy-400">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------------- contact */}
        <ContactSection />

        {/* ----------------------------------------------------------------- cta */}
        <section className="pb-16 sm:pb-20">
          <div className="neu-dark relative overflow-hidden rounded-neu-lg px-6 py-10 sm:px-12 sm:py-14">
            <div className="glow-blob -left-10 top-0 h-48 w-48 bg-ceyteq-neon/25" />
            <div className="glow-blob -right-6 bottom-0 h-56 w-56 bg-ceyteq-500/25" />
            <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.2em] text-ceyteq-neon text-glow-neon">
                  <Icon.sparkles size={14} />
                  Ready when you are
                </p>
                <h2 className="mt-4 text-[28px] font-semibold leading-tight text-white sm:text-[36px]">
                  Join the Digital Race with a five-minute onboarding.
                </h2>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/65">
                  Fill the form once. Your restaurant details, owner contacts, social profiles and
                  brand colours flow straight into the Ceyteq build queue.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/form/${featured?.slug ?? FEATURED_SLUG}`}
                    className="neu-btn-primary neu-btn !px-7 !py-3.5"
                  >
                    Start onboarding
                    <Icon.arrowRight size={16} />
                  </Link>
                  <Link
                    href="/admin/login"
                    className="neu-btn inline-flex items-center justify-center gap-2 !px-6 !py-3.5 text-[13.5px] font-semibold text-navy-700"
                  >
                    <Icon.shield size={16} />
                    Admin access
                  </Link>
                </div>
              </div>

              <div className="relative grid gap-3">
                {[
                  { label: "Server-side validation", icon: "shield" as const },
                  { label: "Postgres-ready schema", icon: "layers" as const },
                  { label: "CSV export in one click", icon: "download" as const },
                ].map((item) => {
                  const Glyph = Icon[item.icon];
                  return (
                    <div
                      key={item.label}
                      className="neu-dark-inset flex items-center gap-3 rounded-2xl px-4 py-3"
                    >
                      <Glyph size={16} className="text-ceyteq-neon drop-shadow-[0_0_8px_rgba(0, 210, 255,0.85)]" />
                      <span className="text-[12.5px] font-semibold text-white/85">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  copy: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-ceyteq-600">{eyebrow}</p>
      <h2 className="mt-3 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[32px]">
        {title}
      </h2>
      <p className="mt-3 text-[14px] leading-relaxed text-navy-400">{copy}</p>
    </div>
  );
}

function SectionIcon({ name }: { name: string }) {
  const map: Record<string, keyof typeof Icon> = {
    store: "store",
    user: "user",
    link: "link",
    palette: "palette",
    notes: "notes",
    spark: "spark",
    phone: "phone",
    mail: "mail",
    globe: "globe",
    shield: "shield",
  };
  const Glyph = Icon[map[name] ?? "spark"];
  return <Glyph size={18} />;
}

/** Slightly darken a hex colour for the 3D swatch gradient. */
function shade(hex: string, amount = 0.28) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  const r = Math.max(0, Math.round(((value >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((value >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((value & 255) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}
