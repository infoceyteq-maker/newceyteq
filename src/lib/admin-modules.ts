/**
 * ---------------------------------------------------------------------------
 * Ceyteq control-centre module registry
 * ---------------------------------------------------------------------------
 *
 * THIS FILE IS THE SINGLE SOURCE OF TRUTH for the admin navigation.
 * The sidebar, the mobile drawer/bottom bar and the dashboard module cards all
 * render from `ADMIN_MODULES`.
 *
 * To add a new system:
 *   1. add one entry below (key, label, icon, href, status, children)
 *   2. add the matching folder/page under `src/app/admin/(dashboard)/<key>`
 * Nothing else needs editing — navigation, mobile nav, dashboard cards and the
 * "More systems" slot list all pick the entry up automatically.
 *
 * `status: "live"` renders a working link; `status: "soon"` renders the
 * neumorphic "Coming soon" placeholder shell.
 */

import type { IconName } from "@/components/icons";

export type AdminModuleStatus = "live" | "soon";

/** Metrics the shell can hydrate into navigation badges. */
export type AdminBadgeKey =
  | "forms"
  | "clients"
  | "submissions"
  | "newSubmissions"
  | "leads"
  | "newLeads";

export type AdminBadgeCounts = Partial<Record<AdminBadgeKey, number>>;

export type AdminNavChild = {
  key: string;
  label: string;
  icon: IconName;
  href: string;
  status: AdminModuleStatus;
  description?: string;
  badge?: AdminBadgeKey;
  /** Short label for the mobile bottom bar. */
  short?: string;
  /** Shown in the mobile bottom bar (keep this to five entries max). */
  mobile?: boolean;
};

export type AdminModule = {
  key: string;
  label: string;
  icon: IconName;
  href: string;
  status: AdminModuleStatus;
  /** One-line summary used on dashboard cards and placeholder pages. */
  description: string;
  /** Short tag shown on the dashboard card, e.g. "Leads & forms". */
  tag?: string;
  badge?: AdminBadgeKey;
  /** Short label for the mobile bottom bar. */
  short?: string;
  /** Shown in the mobile bottom bar (keep this to five entries max). */
  mobile?: boolean;
  children: AdminNavChild[];
};

export const ADMIN_MODULES: AdminModule[] = [
  {
    key: "overview",
    label: "Overview",
    icon: "chart",
    href: "/admin",
    status: "live",
    description: "Company-wide stats, 7-day activity and the live sales pipeline.",
    tag: "Control centre",
    short: "Home",
    mobile: true,
    children: [],
  },
  {
    key: "leads-forms",
    label: "Leads & Forms",
    icon: "forms",
    href: "/admin/leads-forms",
    status: "live",
    description:
      "Restaurant clients, social enquiries, the form generator and every response in one module.",
    tag: "Live module",
    children: [
      {
        key: "clients",
        label: "Restaurant Clients",
        icon: "store",
        href: "/admin/clients",
        status: "live",
        description: "Every restaurant that completed onboarding.",
        badge: "clients",
        short: "Clients",
      },
      {
        key: "leads",
        label: "Social & Email Leads",
        icon: "mail",
        href: "/admin/leads",
        status: "live",
        description: "Facebook, Instagram, TikTok, WhatsApp, email and website enquiries.",
        badge: "newLeads",
        short: "Leads",
        mobile: true,
      },
      {
        key: "forms",
        label: "Form Generator",
        icon: "layers",
        href: "/admin/forms",
        status: "live",
        description: "Compose sections, fields and rules, then publish a link.",
        badge: "forms",
        short: "Forms",
        mobile: true,
      },
      {
        key: "responses",
        label: "Responses",
        icon: "inbox",
        href: "/admin/submissions",
        status: "live",
        description: "Validated submissions with notes and CSV export.",
        badge: "newSubmissions",
        short: "Replies",
        mobile: true,
      },
    ],
  },
  {
    key: "web-studio",
    label: "Web Studio",
    icon: "palette",
    href: "/admin/web-studio",
    status: "soon",
    description: "Brand themes, page blocks and storefront previews for every client.",
    tag: "Next up",
    children: [],
  },
  {
    key: "websites",
    label: "Websites",
    icon: "globe",
    href: "/admin/websites",
    status: "soon",
    description: "Manage the company site plus every client website from a single console.",
    tag: "Planned",
    children: [],
  },
  {
    key: "more-systems",
    label: "More Systems",
    icon: "stack",
    href: "/admin/more-systems",
    status: "live",
    description: "Reserved slots for the modules joining the control centre next.",
    tag: "Extensible",
    children: [],
  },
  {
    key: "settings",
    label: "Settings",
    icon: "settings",
    href: "/admin/settings",
    status: "live",
    description: "Workspace identity, database details and platform configuration.",
    tag: "Workspace",
    short: "Settings",
    mobile: true,
    children: [],
  },
];

/** Look up a module by key — placeholder pages use this instead of copy-paste. */
export function moduleByKey(key: string): AdminModule {
  const module = ADMIN_MODULES.find((entry) => entry.key === key);
  if (!module) {
    throw new Error(
      `Unknown admin module "${key}". Add it to ADMIN_MODULES in src/lib/admin-modules.ts first.`,
    );
  }
  return module;
}

/* ------------------------------- role label ------------------------------- */

/**
 * The account roles stored in the database are implementation details; the
 * control centre always presents the signed-in operator as the Super Master
 * Admin, with a sensible fallback for future roles.
 */
export function roleLabel(role: string | null | undefined) {
  const value = (role ?? "").toLowerCase();
  if (["owner", "admin", "super_admin", "super-master", "super master admin"].includes(value)) {
    return "Super Master Admin";
  }
  if (!value) return "Super Master Admin";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* ------------------------------- navigation ------------------------------- */

export type AdminLink = {
  key: string;
  label: string;
  icon: IconName;
  href: string;
  status: AdminModuleStatus;
  badge?: AdminBadgeKey;
  /** Live module that groups sub-pages — rendered with a "LIVE" pill. */
  liveHint?: boolean;
  /** Short label for the mobile bottom bar. */
  short?: string;
  /** `true` when the link targets `/admin` itself. */
  exact?: boolean;
};

/** Flat list of every routable admin link (modules first, then their children). */
export function adminLinks(): AdminLink[] {
  const links: AdminLink[] = [];
  for (const module of ADMIN_MODULES) {
    links.push({
      key: module.key,
      label: module.label,
      icon: module.icon,
      href: module.href,
      status: module.status,
      badge: module.badge,
      liveHint: module.status === "live" && module.children.length > 0,
      short: module.short,
      exact: module.href === "/admin",
    });
    for (const child of module.children) {
      links.push({
        key: `${module.key}/${child.key}`,
        label: child.label,
        icon: child.icon,
        href: child.href,
        status: child.status,
        badge: child.badge,
        short: child.short,
      });
    }
  }
  return links;
}

export function isAdminHrefActive(pathname: string, link: AdminLink) {
  if (link.exact) return pathname === link.href;
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

function matchesHref(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The module that owns the current URL (used for page-level context). */
export function activeAdminModule(pathname: string): AdminModule | undefined {
  return ADMIN_MODULES.find(
    (module) =>
      matchesHref(pathname, module.href, module.href === "/admin") ||
      module.children.some((child) => matchesHref(pathname, child.href)),
  );
}

/** Live modules — the dashboard cards. */
export const LIVE_MODULES = ADMIN_MODULES.filter((module) => module.status === "live");

/** Placeholder modules — the "Coming soon" pages and the More-systems slots. */
export const SOON_MODULES = ADMIN_MODULES.filter((module) => module.status === "soon");

/**
 * Reserved slots for systems that are not built yet. These are intentionally
 * data-only so the "More systems" page and the dashboard gain tiles the moment
 * a real module is added to `ADMIN_MODULES`.
 */
export const UPCOMING_SYSTEMS = [
  {
    key: "brand-kit",
    label: "Brand Kit Studio",
    icon: "palette" as IconName,
    description: "Colour palettes, logo exports and typography packs per client.",
  },
  {
    key: "billing",
    label: "Billing & Invoices",
    icon: "notes" as IconName,
    description: "Plans, invoices and payment status for every retainer.",
  },
  {
    key: "analytics",
    label: "Growth Analytics",
    icon: "chart" as IconName,
    description: "Traffic, enquiry sources and conversion trends across clients.",
  },
  {
    key: "support",
    label: "Support Desk",
    icon: "shield" as IconName,
    description: "Tickets, SLAs and client conversations in one queue.",
  },
];

/** Bottom bar destinations on mobile, derived from the registry above. */
export function mobileNavLinks(): AdminLink[] {
  return adminLinks().filter((link) => {
    const [moduleKey, childKey] = link.key.split("/");
    const module = ADMIN_MODULES.find((entry) => entry.key === moduleKey);
    if (!module) return false;
    if (childKey) {
      return Boolean(module.children.find((child) => child.key === childKey)?.mobile);
    }
    return Boolean(module.mobile);
  });
}
