import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="px-3 pb-6 pt-16 sm:px-5">
      <div className="mx-auto max-w-7xl">
        <div className="neu-raised rounded-neu-lg p-6 sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo height={44} />
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-navy-300">
                The Ceyteq Digital Race platform gives every restaurant a five-minute path to a
                launch-ready digital identity — dynamic onboarding forms, brand themes and live
                submissions in one place.
              </p>
              <div className="mt-5 flex items-center gap-2.5">
                {[
                  { href: "https://facebook.com", label: "Facebook", icon: "facebook" as const },
                  { href: "https://instagram.com", label: "Instagram", icon: "instagram" as const },
                  { href: "https://tiktok.com", label: "TikTok", icon: "tiktok" as const },
                  { href: "https://maps.google.com", label: "Google Maps", icon: "map" as const },
                ].map((social) => {
                  const Glyph = Icon[social.icon];
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={social.label}
                      className="neu-orb h-10 w-10 text-navy-400 transition-all hover:-translate-y-0.5 hover:text-ceyteq-500"
                    >
                      <Glyph size={17} />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">Platform</p>
              <ul className="mt-4 space-y-2.5 text-[13.5px] font-semibold text-navy-400">
                <li>
                  <Link href="/#platform" className="transition-colors hover:text-ceyteq-500">
                    Dynamic form engine
                  </Link>
                </li>
                <li>
                  <Link href="/form/restaurant-onboarding" className="transition-colors hover:text-ceyteq-500">
                    Restaurant onboarding
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="transition-colors hover:text-ceyteq-500">
                    Admin dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="transition-colors hover:text-ceyteq-500">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-navy-300">Contact</p>
              <ul className="mt-4 space-y-3 text-[13.5px] font-semibold text-navy-400">
                <li className="flex items-center gap-2.5">
                  <Icon.mail size={16} className="text-ceyteq-500" />
                  hello@ceyteq.com
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon.phone size={16} className="text-ceyteq-500" />
                  +94 11 234 5678
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon.map size={16} className="text-ceyteq-500" />
                  Colombo, Sri Lanka
                </li>
              </ul>
            </div>
          </div>

          <div className="neu-divider my-7" />

          <div className="flex flex-col items-center justify-between gap-3 text-[12px] font-semibold text-navy-300 sm:flex-row">
            <p>© {new Date().getFullYear()} Ceyteq. Empowering Digital Evolution.</p>
            <p className="flex items-center gap-1.5">
              <Icon.shield size={13} />
              Built with Next.js · Prisma · PostgreSQL-ready
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
