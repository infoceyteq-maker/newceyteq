"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/utils";

export type ManageableForm = {
  id: string;
  slug: string;
  title: string;
  status: string;
  submissionCount: number;
  fieldCount: number;
  updatedAt: string;
};

type Props = {
  forms: ManageableForm[];
  /** Fallback origin when NEXT_PUBLIC_SITE_URL is not configured. */
  siteUrl?: string;
};

function statusLabel(status: string) {
  return status === "published" ? "Live" : "Draft";
}

/**
 * Form Link Manager — the single place to view, copy, share and manage the
 * public link of the active dynamic form. Works for every form in the system,
 * not just the restaurant onboarding one.
 */
export function FormLinkManager({ forms, siteUrl }: Props) {
  const [origin, setOrigin] = useState<string>("");
  const [activeId, setActiveId] = useState<string>(() => {
    const published = forms.find((form) => form.status === "published");
    return published?.id ?? forms[0]?.id ?? "";
  });

  // Resolve the real public origin in the browser so copied links always work
  // on whatever domain the dashboard is served from.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const active = useMemo(
    () => forms.find((form) => form.id === activeId) ?? forms[0],
    [forms, activeId],
  );

  const base = origin || siteUrl || "";
  const path = active ? `/form/${active.slug}` : "";
  const absolute = base && path ? `${base}${path}` : path;
  const published = forms.filter((form) => form.status === "published");

  if (!active) {
    return (
      <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
        <h2 className="text-[16px] font-bold text-navy-700">Form Link Manager</h2>
        <p className="mt-2 text-[12.5px] font-medium text-navy-400">
          No forms yet. Create a form to publish a public link.
        </p>
        <Link href="/admin/forms/new" className="neu-btn mt-4 !py-2.5 !text-[12.5px]">
          <Icon.plus size={14} />
          Create form
        </Link>
      </section>
    );
  }

  return (
    <section className="neu-dark relative overflow-hidden rounded-neu-lg p-5 sm:p-6">
      <span className="glow-blob -right-10 -top-14 h-40 w-40 bg-ceyteq-neon/25" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/55">
            <span className="neon-dot" />
            Form Link Manager
          </p>
          <h2 className="mt-2 text-[17px] font-semibold text-white">
            {active.title}
          </h2>
          <p className="mt-1 text-[12px] font-medium text-white/55">
            {published.length} live · {forms.length} total · {active.fieldCount} fields ·{" "}
            {active.submissionCount} response{active.submissionCount === 1 ? "" : "s"}
          </p>
        </div>

        <span
          className={cn(
            "neu-badge",
            active.status === "published"
              ? "bg-ceyteq-neon/15 text-ceyteq-neon shadow-[0_0_14px_rgba(0,210,255,0.28)]"
              : "bg-white/[0.08] text-white/60",
          )}
        >
          <span className={active.status === "published" ? "neon-dot" : "h-2 w-2 rounded-full bg-white/40"} />
          {statusLabel(active.status)}
        </span>
      </div>

      {/* The link itself, in a sunken dark well so it reads as an address bar. */}
      <div className="neu-dark-inset relative mt-4 rounded-2xl px-3.5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
          Active public link
        </p>
        <p className="mt-1 break-all font-mono text-[12.5px] font-semibold text-ceyteq-neon">
          {absolute || path}
        </p>
      </div>

      <div className="relative mt-3.5 flex flex-wrap gap-2">
        <CopyButton
          value={path}
          label="Copy link"
          copiedLabel="Link copied"
          variant="dark"
        />
        <Link
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/20"
        >
          <Icon.external size={13} />
          Open form
        </Link>
        <Link
          href={`/admin/forms/${active.id}`}
          className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/20"
        >
          <Icon.settings size={13} />
          Manage form
        </Link>
        <Link
          href="/admin/submissions"
          className="inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/20"
        >
          <Icon.inbox size={13} />
          Responses
        </Link>
      </div>

      {forms.length > 1 ? (
        <div className="relative mt-5 border-t border-white/10 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">
            All public links
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {forms.map((form) => (
              <button
                key={form.id}
                type="button"
                onClick={() => setActiveId(form.id)}
                aria-pressed={form.id === active.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[11.5px] font-semibold transition-all duration-250",
                  form.id === active.id
                    ? "bg-ceyteq-neon/15 text-ceyteq-neon shadow-[inset_0_0_16px_rgba(0,210,255,0.25),0_0_0_1px_rgba(0,210,255,0.4)]"
                    : "bg-white/[0.06] text-white/65 hover:text-white",
                )}
              >
                <Icon.link size={12} />
                {form.title}
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">
                  {statusLabel(form.status)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
