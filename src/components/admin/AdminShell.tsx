"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/icons";
import { cn, initials } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof Icon;
  badge?: number | null;
  exact?: boolean;
  group: "Clients" | "Form engine" | "Workspace";
};

export function AdminShell({
  user,
  newCount,
  formCount,
  clientCount,
  newLeadCount,
  children,
}: {
  user: { name: string; email: string; role: string };
  newCount: number;
  formCount: number;
  clientCount: number;
  newLeadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const nav: NavItem[] = [
    { href: "/admin", label: "Overview", icon: "chart", exact: true, group: "Workspace" },
    {
      href: "/admin/clients",
      label: "Restaurant Clients",
      icon: "store",
      badge: clientCount || null,
      group: "Clients",
    },
    {
      href: "/admin/leads",
      label: "Leads & Inquiries",
      icon: "mail",
      badge: newLeadCount || null,
      group: "Clients",
    },
    {
      href: "/admin/forms",
      label: "Form Generator",
      icon: "forms",
      badge: formCount || null,
      group: "Form engine",
    },
    {
      href: "/admin/submissions",
      label: "Responses",
      icon: "inbox",
      badge: newCount || null,
      group: "Form engine",
    },
    { href: "/admin/settings", label: "Settings", icon: "settings", group: "Workspace" },
  ];

  const GROUPS: Array<NavItem["group"]> = ["Clients", "Form engine", "Workspace"];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  const SidebarContent = (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Logo href="/" height={32} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="neu-btn h-9 w-9 !px-0 lg:hidden"
        >
          <Icon.close size={16} />
        </button>
      </div>

      <div className="neu-sunken flex items-center gap-2.5 rounded-2xl px-3.5 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,#1a2447,#0F1B3D)] text-[11px] font-bold text-white">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-bold text-navy-600">{user.name}</p>
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-navy-300">
            {user.role}
          </p>
        </div>
        <span className="neon-dot" aria-hidden />
      </div>

      <nav className="flex-1 space-y-1.5">
        {GROUPS.map((group) => (
          <div key={group} className="space-y-1.5">
            <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-300">
              {group}
            </p>
            {nav
              .filter((item) => item.group === group)
              .map((item) => {
                const Glyph = Icon[item.icon];
                const active = isActive(item);
                return (
                  <Link key={item.href} href={item.href} className="nav-link" data-active={active}>
                    <Glyph size={18} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "rounded-pill px-2 py-0.5 text-[10px] font-bold",
                          active
                            ? "bg-ceyteq-neon text-navy-800 shadow-neon-sm"
                            : "bg-ash-50 text-navy-400",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        ))}

        <div className="neu-divider my-3" />
        <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-navy-300">
          Quick actions
        </p>
        <Link href="/form/restaurant-onboarding" target="_blank" className="nav-link">
          <Icon.external size={18} />
          <span className="flex-1">View live form</span>
        </Link>
      </nav>

      <button type="button" onClick={signOut} disabled={signingOut} className="neu-btn w-full !py-2.5 !text-[12.5px]">
        <Icon.logout size={15} className="text-navy-300" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 px-3 pt-3 lg:hidden">
        <div className="neu flex items-center justify-between rounded-pill px-3 py-2.5">
          <Logo href="/" height={28} />
          <div className="flex items-center gap-2">
            <Link href="/admin/leads" className="neu-btn relative h-9 w-9 !px-0" aria-label="Leads">
              <Icon.mail size={16} />
              {newCount ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ceyteq-500 px-1 text-[9px] font-bold text-white">
                  {newCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="neu-btn h-9 w-9 !px-0"
            >
              <Icon.menu size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-3 pb-10 pt-3 sm:px-5 lg:pt-5">
        {/* Desktop sidebar */}
        <aside className="sticky top-5 hidden h-[calc(100dvh-2.5rem)] w-[264px] shrink-0 lg:block">
          <div className="neu h-full rounded-neu-lg p-4">{SidebarContent}</div>
        </aside>

        {/* Mobile drawer */}
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-navy-800/30 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] p-3">
              <div className="neu-raised animate-fade-up h-full rounded-neu-lg p-4">{SidebarContent}</div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
