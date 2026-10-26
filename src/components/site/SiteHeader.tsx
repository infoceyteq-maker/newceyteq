"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { CONTACT, SITE } from "@/lib/site-config";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#platform", label: "Platform" },
  { href: "/#how", label: "How it works" },
  { href: "/#forms", label: "Forms" },
  { href: "/#contact", label: "Contact" },
];

const ONBOARDING_HREF = `/form/${SITE.onboardingSlug}`;

export function SiteHeader({ authenticated = false }: { authenticated?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-pill px-3 py-2.5 transition-all duration-300 sm:px-5 sm:py-3",
          "bg-ash-200 shadow-neu",
          scrolled ? "shadow-neu-lg" : "shadow-neu",
        )}
      >
        <Logo height={34} priority className="sm:hidden" />
        <Logo height={42} priority className="hidden sm:block" />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-pill px-4 py-2 text-[13.5px] font-semibold text-navy-400 transition-all duration-200 hover:bg-ash-200 hover:text-navy-700 hover:shadow-neu-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Ceyteq on WhatsApp"
            title="Chat with Ceyteq on WhatsApp"
            className="neu-orb hidden h-11 w-11 rounded-full text-navy-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-ceyteq-500 md:grid"
          >
            <Icon.whatsapp size={17} />
          </a>
          <a
            href={CONTACT.hotlineTel}
            aria-label="Call the Ceyteq hotline"
            title="Ceyteq hotline"
            className="neu-btn hidden h-11 items-center gap-2 !px-4 !py-0 text-[13px] font-semibold text-navy-600 xl:inline-flex"
          >
            <Icon.phone size={15} className="text-ceyteq-500" />
            {" "}Hotline
          </a>
          <Link
            href={authenticated ? "/admin" : "/admin/login"}
            className="hidden rounded-pill px-4 py-2.5 text-[13px] font-semibold text-navy-500 transition-colors duration-200 hover:text-ceyteq-600 sm:inline-flex"
          >
            {authenticated ? "Dashboard" : "Admin login"}
          </Link>
          <Link href={ONBOARDING_HREF} className="neu-btn-primary neu-btn hidden !px-5 !py-2.5 !text-[13px] sm:inline-flex">
            Start onboarding
            <Icon.arrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="neu-orb h-11 w-11 rounded-full !px-0 text-navy-600 lg:hidden"
          >
            {open ? <Icon.close size={18} /> : <Icon.menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-7xl lg:hidden">
          <div className="neu animate-fade-up rounded-[28px] p-3">
            <nav className="grid gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-[14px] font-semibold text-navy-500 transition-colors hover:bg-ash-100 hover:text-navy-700 hover:shadow-neu-sm"
                >
                  {link.label}
                </Link>
              ))}
              <div className="neu-divider my-1" />
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold text-navy-500 hover:bg-ash-100 hover:shadow-neu-sm"
              >
                <Icon.whatsapp size={16} className="text-ceyteq-500" /> WhatsApp us
              </a>
              <a
                href={CONTACT.hotlineTel}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold text-navy-500 hover:bg-ash-100 hover:shadow-neu-sm"
              >
                <Icon.phone size={16} className="text-ceyteq-500" /> Hotline
              </a>
              <div className="neu-divider my-1" />
              <Link
                href={authenticated ? "/admin" : "/admin/login"}
                className="rounded-2xl px-4 py-3 text-[14px] font-semibold text-navy-500 hover:bg-ash-100 hover:shadow-neu-sm"
              >
                {authenticated ? "Dashboard" : "Admin login"}
              </Link>
              <Link href={ONBOARDING_HREF} className="neu-btn-primary neu-btn mt-1 !py-3">
                Start onboarding
                <Icon.arrowRight size={15} />
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
