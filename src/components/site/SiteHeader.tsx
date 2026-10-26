"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#platform", label: "Platform" },
  { href: "/#how", label: "How it works" },
  { href: "/#forms", label: "Forms" },
];

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
          "mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[26px] px-3 py-2.5 transition-all duration-300 sm:px-5 sm:py-3",
          scrolled
            ? "border border-white/70 bg-[linear-gradient(150deg,rgba(250,252,255,0.94),rgba(231,236,243,0.9))] shadow-[0_18px_44px_-20px_rgba(120,138,164,0.55)] backdrop-blur-xl"
            : "border border-white/40 bg-white/35 shadow-[0_10px_30px_-24px_rgba(120,138,164,0.5)] backdrop-blur-md",
        )}
      >
        <Logo height={34} priority className="sm:hidden" />
        <Logo height={42} priority className="hidden sm:block" />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-pill px-4 py-2 text-[13.5px] font-semibold text-navy-400 transition-all hover:bg-white/60 hover:text-navy-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={authenticated ? "/admin" : "/admin/login"}
            className="hidden rounded-pill px-4 py-2.5 text-[13px] font-semibold text-navy-500 transition-colors hover:text-ceyteq-500 sm:inline-flex"
          >
            {authenticated ? "Dashboard" : "Admin login"}
          </Link>
          <Link href="/form/restaurant-onboarding" className="neu-btn-primary neu-btn hidden !px-5 !py-2.5 !text-[13px] sm:inline-flex">
            Start onboarding
            <Icon.arrowRight size={15} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="neu-btn h-11 w-11 !px-0 lg:hidden"
          >
            {open ? <Icon.close size={18} /> : <Icon.menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mx-auto mt-2 max-w-7xl lg:hidden">
          <div className="neu-raised animate-fade-up rounded-[26px] p-3">
            <nav className="grid gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-[14px] font-semibold text-navy-500 transition-colors hover:bg-white/70 hover:text-navy-700"
                >
                  {link.label}
                </Link>
              ))}
              <div className="neu-divider my-1" />
              <Link
                href={authenticated ? "/admin" : "/admin/login"}
                className="rounded-2xl px-4 py-3 text-[14px] font-semibold text-navy-500 hover:bg-white/70"
              >
                {authenticated ? "Dashboard" : "Admin login"}
              </Link>
              <Link
                href="/form/restaurant-onboarding"
                className="neu-btn-primary neu-btn mt-1 !py-3"
              >
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
