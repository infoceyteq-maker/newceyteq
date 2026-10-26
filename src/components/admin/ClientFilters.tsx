"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "all", label: "All clients" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
];

/** Search + status filter for the Restaurant Clients module. */
export function ClientFilters({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const active = params.get("status") ?? "all";

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const push = (next: Record<string, string | null>) => {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) search.delete(key);
      else search.set(key, value);
    }
    const qs = search.toString();
    startTransition(() => router.replace(qs ? `/admin/clients?${qs}` : "/admin/clients"));
  };

  return (
    <div className="neu rounded-neu p-3.5">
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
            placeholder="Search restaurant, owner, city, email or reference…"
            aria-label="Search clients"
            className="neu-input !py-2.5 !pl-11 !text-[13px]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => push({ status: status.value === "all" ? null : status.value })}
              data-active={active === status.value}
              className="neu-chip !py-1.5 !text-[11.5px]"
            >
              {status.label}
              <span className={cn("font-bold", active === status.value ? "text-white/80" : "text-navy-300")}>
                {status.value === "all" ? counts.all ?? 0 : counts[status.value] ?? 0}
              </span>
            </button>
          ))}
          {pending ? <span className="neon-dot" aria-hidden /> : null}
        </div>
      </div>
    </div>
  );
}
