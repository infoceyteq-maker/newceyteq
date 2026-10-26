import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DynamicForm } from "@/components/form/DynamicForm";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";
import { getSessionUser } from "@/lib/auth";
import { formDTO } from "@/lib/forms";
import { getFormBySlug } from "@/lib/services/forms-service";
import { CONTACT, CONTACT_CHANNELS, SOCIAL_LINKS } from "@/lib/site-config";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const form = await getFormBySlug(slug);
    if (!form) return { title: "Form not found" };
    return {
      title: form.title,
      description: form.description || "Complete your Ceyteq onboarding form.",
      robots: form.status === "published" ? { index: true, follow: true } : { index: false, follow: false },
    };
  } catch {
    return { title: "Onboarding form" };
  }
}

export default async function PublicFormPage({ params }: PageProps) {
  const { slug } = await params;

  const form = await getFormBySlug(slug).catch(() => null);
  if (!form) notFound();

  const user = await getSessionUser();
  const isPreview = form.status !== "published";

  // Drafts and archived forms are only visible to signed-in administrators.
  if (isPreview && !user) notFound();

  const dto = formDTO(form);
  const fieldCount = dto.sections.reduce((total, section) => total + section.fields.length, 0);
  const requiredCount = dto.sections.reduce(
    (total, section) => total + section.fields.filter((field) => field.required).length,
    0,
  );

  return (
    <div className="relative min-h-screen bg-ash-300">
      <div className="glow-blob -left-24 top-10 h-72 w-72 bg-ash-50" />
      <div className="glow-blob right-0 top-1/3 h-80 w-80 bg-ash-100" />

      <header className="relative z-10 px-3 pt-4 sm:px-6">
        <div className="neu mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-pill px-3 py-2.5 sm:px-5">
          <Logo height={36} priority />
          <div className="flex items-center gap-2">
            <span className="neu-chip hidden !py-1.5 !text-[10.5px] uppercase tracking-[0.14em] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secure form
            </span>
            <Link href="/" className="neu-btn-ghost hidden sm:inline-flex">
              <Icon.arrowLeft size={14} />
              Home
            </Link>
            <Link
              href={user ? "/admin" : "/admin/login"}
              className="neu-btn !px-4 !py-2 !text-[12.5px]"
            >
              <Icon.shield size={14} className="text-ceyteq-500" />
              {user ? "Dashboard" : "Admin"}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-8 text-center sm:mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="neu-badge bg-[linear-gradient(150deg,#f7f9fc,#e6ebf3)] text-navy-400">
              <Icon.sparkles size={12} className="text-ceyteq-500" />
              Ceyteq Digital Race
            </span>
            {isPreview ? (
              <span className="neu-badge bg-amber-100/80 text-amber-700">
                <Icon.eye size={12} />
                {form.status} preview
              </span>
            ) : null}
            <span className="neu-badge bg-ash-100 text-navy-300">/form/{form.slug}</span>
          </div>

          <h1 className="mx-auto mt-4 max-w-3xl text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-navy-700 sm:text-[44px]">
            {form.title}
          </h1>
          {form.description ? (
            <p className="mx-auto mt-3 max-w-2xl text-[14.5px] leading-relaxed text-navy-400">
              {form.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: "layers" as const, label: `${dto.sections.length} sections` },
              { icon: "forms" as const, label: `${fieldCount} fields` },
              { icon: "shield" as const, label: `${requiredCount} required` },
              { icon: "clock" as const, label: "≈ 3 minutes" },
            ].map((item) => {
              const Glyph = Icon[item.icon];
              return (
                <span
                  key={item.label}
                  className="neu inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-[11.5px] font-semibold text-navy-400"
                >
                  <Glyph size={13} className="text-ceyteq-500" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>

        <DynamicForm form={dto} preview={isPreview} />
      </main>

      <footer className="relative z-10 px-4 pb-10 pt-6 sm:px-6">
        <div className="neu mx-auto max-w-4xl rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="neu-chip"
            >
              <Icon.whatsapp size={13} className="text-ceyteq-500" />
              WhatsApp us
            </a>
            <a href={CONTACT.hotlineTel} className="neu-chip">
              <Icon.phone size={13} className="text-ceyteq-500" />
              {CONTACT_CHANNELS[0]?.value}
            </a>
            <a href={CONTACT.email} className="neu-chip">
              <Icon.mail size={13} className="text-ceyteq-500" />
              {CONTACT.emailAddress}
            </a>
            {SOCIAL_LINKS.map((social) => {
              const Glyph = Icon[social.icon];
              return (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="neu-orb h-8 w-8 text-navy-400 transition-colors hover:text-ceyteq-500"
                >
                  <Glyph size={13} />
                </a>
              );
            })}
          </div>

          <div className="neu-divider my-4" />
          <div className="flex flex-col items-center justify-between gap-2 text-[11.5px] font-semibold text-navy-300 sm:flex-row">
            <p>© {new Date().getFullYear()} Ceyteq. Empowering Digital Evolution.</p>
            <p className="flex items-center gap-1.5">
              <Icon.shield size={13} />
              Your answers are validated server-side and stored securely
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
