"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/leads";
import { cn } from "@/lib/utils";

/** Search + status + source filter for the Leads & Inquiries module. */
export function LeadFilters({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const status = params.get("status") ?? "all";
  const source = params.get("source") ?? "all";

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const push = (next: Record<string, string | null>) => {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") search.delete(key);
      else search.set(key, value);
    }
    const qs = search.toString();
    startTransition(() => router.replace(qs ? `/admin/leads?${qs}` : "/admin/leads"));
  };

  return (
    <div className="neu rounded-neu p-3.5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              push({ q: query.trim() || null });
            }}
            className="relative flex-1"
          >
            <Icon.search
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, phone, business or message…"
              aria-label="Search leads"
              className="neu-input !py-2.5 !pl-11 !text-[13px]"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {LEAD_STATUSES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => push({ status: option.value })}
                data-active={status === option.value}
                className="neu-chip !py-1.5 !text-[11.5px]"
              >
                {option.label}
                <span
                  className={cn(
                    "font-bold",
                    status === option.value ? "text-white/80" : "text-navy-300",
                  )}
                >
                  {option.value === "new" ? counts.new ?? 0 : counts[option.value] ?? 0}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => push({ status: "all" })}
              data-active={status === "all"}
              className="neu-chip !py-1.5 !text-[11.5px]"
            >
              All
              <span className={cn("font-bold", status === "all" ? "text-white/80" : "text-navy-300")}>
                {counts.total ?? 0}
              </span>
            </button>
            {pending ? <span className="neon-dot" aria-hidden /> : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
            Source
          </span>
          <button
            type="button"
            onClick={() => push({ source: "all" })}
            data-active={source === "all"}
            className="neu-chip !py-1 !text-[11px]"
          >
            All sources
          </button>
          {LEAD_SOURCES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => push({ source: option.value })}
              data-active={source === option.value}
              className="neu-chip !py-1 !text-[11px]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
