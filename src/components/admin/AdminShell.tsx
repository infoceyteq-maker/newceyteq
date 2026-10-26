"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { LiveSignal } from "@/components/admin/LiveSignal";
import { Icon } from "@/components/icons";
import {
  ADMIN_MODULES,
  isAdminHrefActive,
  mobileNavLinks,
  roleLabel,
  type AdminBadgeCounts,
  type AdminLink,
} from "@/lib/admin-modules";
import { cn, initials } from "@/lib/utils";

const COLLAPSE_KEY = "ceyteq:admin-sidebar-collapsed";

/**
 * The control-centre chrome. Every destination comes from `ADMIN_MODULES`, so
 * new systems appear here automatically. Desktop keeps a collapsible rail;
 * mobile gets a drawer plus a bottom bar.
 */
export function AdminShell({
  user,
  counts,
  children,
}: {
  user: { name: string; email: string; role: string };
  counts: AdminBadgeCounts;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* storage blocked — keep the expanded rail */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

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

  const bottomLinks = useMemo(() => mobileNavLinks(), []);
  const role = roleLabel(user.role);

  const badgeFor = (link: AdminLink) => (link.badge ? counts[link.badge] ?? 0 : 0);

  const renderLink = (link: AdminLink, { nested = false, rail = false } = {}) => {
    const Glyph = Icon[link.icon];
    const active = isAdminHrefActive(pathname, link);
    const badge = badgeFor(link);
    const soon = link.status === "soon";

    return (
      <Link
        key={link.key}
        href={link.href}
        data-active={active}
        title={rail ? link.label : undefined}
        onClick={() => setDrawer(false)}
        className={cn(
          "nav-link",
          nested && !rail && "ml-3 !py-2.5 !pl-3.5 !text-[12.5px]",
          rail && "justify-center !px-0",
        )}
      >
        <Glyph size={nested && !rail ? 16 : 18} className={cn(soon && !active && "opacity-70")} />
        {rail ? null : (
          <>
            <span className="flex-1 truncate">{link.label}</span>
            {soon ? (
              <span className="rounded-pill bg-ash-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-navy-300 shadow-neu-inset-sm">
                Soon
              </span>
            ) : null}
            {!soon && link.liveHint ? (
              <span className="inline-flex items-center gap-1 rounded-pill bg-ceyteq-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-ceyteq-600">
                <span className="h-1 w-1 rounded-full bg-ceyteq-500 shadow-neon-sm" />
                Live
              </span>
            ) : null}
            {!soon && badge > 0 ? (
              <span
                className={cn(
                  "rounded-pill px-2 py-0.5 text-[10px] font-bold",
                  active
                    ? "bg-ceyteq-500 text-white"
                    : "bg-ash-100 text-navy-400 shadow-neu-inset-sm",
                )}
              >
                {badge}
              </span>
            ) : null}
          </>
        )}
      </Link>
    );
  };

  const railMode = collapsed;

  const sidebar = (rail = false) => (
    <div className="flex h-full flex-col gap-5">
      {/* Brand + collapse control */}
      <div className={cn("flex items-center", rail ? "justify-center" : "justify-between gap-2")}>
        {rail ? (
          <Link href="/admin" aria-label="Ceyteq control centre" className="grid place-items-center">
            <LogoMark size={30} />
          </Link>
        ) : (
          <Logo href="/admin" height={30} />
        )}
        <button
          type="button"
          onClick={() => setDrawer(false)}
          aria-label="Close navigation"
          className="neu-btn h-9 w-9 !px-0 lg:!hidden"
        >
          <Icon.close size={16} />
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="neu-btn hidden h-9 w-9 !px-0 lg:!inline-flex"
        >
          <Icon.chevronRight size={16} className={cn("transition-transform duration-250", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Signed-in operator */}
      <div
        className={cn(
          "neu-well flex items-center gap-2.5 rounded-2xl px-3 py-2.5",
          rail && "justify-center !px-1.5",
        )}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(150deg,#1a2447,#0F1B3D)] text-[11px] font-bold text-white shadow-[0_0_16px_rgba(61,165,255,0.28)]">
          {initials(user.name)}
        </span>
        {rail ? null : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-bold text-navy-700">{user.name}</p>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.1em] text-navy-300">
              {role}
            </p>
          </div>
        )}
      </div>

      {/* Realtime signal (Supabase) */}
      <LiveSignal compact={rail} />

      {/* Modules */}
      <nav className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto pb-1">
        {ADMIN_MODULES.map((module) => {
          const moduleLink: AdminLink = {
            key: module.key,
            label: module.label,
            icon: module.icon,
            href: module.href,
            status: module.status,
            badge: module.badge,
            liveHint: module.status === "live" && module.children.length > 0,
            exact: module.href === "/admin",
          };
          return (
            <div key={module.key} className="space-y-1">
              {renderLink(moduleLink, { rail })}
              {!rail && module.children.length > 0 ? (
                <div className="space-y-1">
                  {module.children.map((child) =>
                    renderLink(
                      {
                        key: `${module.key}/${child.key}`,
                        label: child.label,
                        icon: child.icon,
                        href: child.href,
                        status: child.status,
                        badge: child.badge,
                      },
                      { nested: true },
                    ),
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      {/* Footer: role + sign out */}
      <div className={cn("space-y-2.5", rail && "flex flex-col items-center")}>
        <div className="neu-divider" />
        {rail ? (
          <span
            className="neon-dot"
            title={`${user.name} · ${role}`}
            aria-label={`${user.name} · ${role}`}
          />
        ) : (
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
            {role}
          </p>
        )}
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          title="Sign out"
          aria-label="Sign out"
          className={cn("neu-btn !py-2.5 !text-[12.5px]", rail ? "w-10 !px-0" : "w-full")}
        >
          <Icon.logout size={15} className="text-navy-400" />
          {rail ? null : signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ash-300">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 px-3 pt-3 lg:hidden">
        <div className="neu flex items-center justify-between rounded-pill px-3 py-2.5">
          <Logo href="/admin" height={28} />
          <div className="flex items-center gap-2">
            <LiveSignal compact />
            <Link
              href="/admin/leads"
              className="neu-btn relative h-9 w-9 !px-0"
              aria-label="Leads & inquiries"
            >
              <Icon.mail size={16} />
              {(counts.newLeads ?? 0) > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ceyteq-500 px-1 text-[9px] font-bold text-white">
                  {counts.newLeads}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Open navigation"
              className="neu-btn h-9 w-9 !px-0"
            >
              <Icon.menu size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-3 pb-28 pt-3 sm:px-5 lg:pb-10 lg:pt-5">
        {/* Desktop rail */}
        <aside
          className={cn(
            "sticky top-5 hidden h-[calc(100dvh-2.5rem)] shrink-0 transition-[width] duration-250 lg:block",
            railMode ? "w-[92px]" : "w-[272px]",
          )}
        >
          <div className="neu h-full rounded-neu-lg p-4">{sidebar(railMode)}</div>
        </aside>

        {/* Mobile drawer */}
        {drawer ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawer(false)}
              className="absolute inset-0 bg-navy-800/40 backdrop-blur-sm"
            />
            <div className="animate-fade-up absolute inset-y-0 left-0 w-[86%] max-w-[330px] p-3">
              <div className="neu h-full overflow-y-auto rounded-neu-lg p-4">{sidebar(false)}</div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 lg:hidden"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="neu flex items-stretch justify-between gap-1 rounded-pill px-2 py-1.5">
          {bottomLinks.map((link) => {
            const Glyph = Icon[link.icon];
            const active = isAdminHrefActive(pathname, link);
            const badge = badgeFor(link);
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-pill px-1 py-2 text-[9.5px] font-bold uppercase tracking-[0.04em] transition-all duration-250",
                  active
                    ? "bg-ash-100 text-navy-700 shadow-neu-inset-sm"
                    : "text-navy-300 hover:text-navy-600",
                )}
              >
                <Glyph size={17} />
                <span className="max-w-full truncate">{link.short ?? link.label}</span>
                {badge > 0 ? (
                  <span className="absolute right-1.5 top-1 h-1.5 w-1.5 rounded-full bg-ceyteq-500 shadow-neon-sm" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
