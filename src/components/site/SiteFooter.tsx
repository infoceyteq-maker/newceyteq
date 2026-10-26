import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";
import { CONTACT, CONTACT_CHANNELS, SOCIAL_LINKS, SITE } from "@/lib/site-config";

export function SiteFooter({ onboardingHref = `/form/${SITE.onboardingSlug}` }: { onboardingHref?: string }) {
  return (
    <footer className="px-3 pb-6 pt-16 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="neu-raised rounded-neu-lg p-6 sm:p-10">
          <div className="grid gap-9 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr]">
            <div>
              <Logo height={44} />
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-navy-300">
                {SITE.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                {SOCIAL_LINKS.map((social) => {
                  const Glyph = Icon[social.icon];
                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} — ${SITE.company}`}
                      title={`${social.label} · ${social.handle}`}
                      className="neu-orb h-10 w-10 text-navy-400 transition-all hover:-translate-y-0.5 hover:text-ceyteq-500"
                    >
                      <Glyph size={17} />
                    </a>
                  );
                })}
              </div>
            </div>

            <nav aria-label="Footer navigation">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">
                Platform
              </p>
              <ul className="mt-4 space-y-2.5 text-[13.5px] font-semibold text-navy-400">
                <li>
                  <Link href="/#platform" className="transition-colors hover:text-ceyteq-500">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href={onboardingHref} className="transition-colors hover:text-ceyteq-500">
                    Restaurant onboarding
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="transition-colors hover:text-ceyteq-500">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="transition-colors hover:text-ceyteq-500">
                    Administrator sign in
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">
                Contact
              </p>
              <ul className="mt-4 space-y-3 text-[13.5px] font-semibold text-navy-400">
                {CONTACT_CHANNELS.map((channel) => {
                  const Glyph = Icon[channel.icon];
                  return (
                  <li key={channel.id}>
                    <a
                      href={channel.href}
                      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group flex items-center gap-2.5 transition-colors hover:text-ceyteq-600"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/70 text-ceyteq-500 neu-inset">
                        <Glyph size={14} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-navy-300">
                          {channel.label}
                        </span>
                        <span className="block truncate">{channel.value}</span>
                      </span>
                    </a>
                  </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="neu-divider my-7" />

          <div className="flex flex-col items-center justify-between gap-3 text-[12px] font-semibold text-navy-300 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {SITE.company}. {SITE.tagline}.
            </p>
            <p className="flex items-center gap-1.5">
              <Icon.shield size={13} />
              Secure submissions · {CONTACT.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
