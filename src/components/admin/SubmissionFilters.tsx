"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import { NeuSelect } from "@/components/ui/NeuSelect";
import { cn } from "@/lib/utils";

type Props = {
  forms: Array<{ id: string; title: string }>;
  counts: Record<string, number>;
};

const STATUSES = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "archived", label: "Archived" },
];

export function SubmissionFilters({ forms, counts }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const formId = params.get("formId") ?? "all";
  const status = params.get("status") ?? "all";

  const push = (next: Record<string, string | null>) => {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "all") search.delete(key);
      else search.set(key, value);
    }
    startTransition(() => {
      router.push(`/admin/submissions${search.toString() ? `?${search.toString()}` : ""}`);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ((params.get("q") ?? "") !== query) push({ q: query || null });
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="neu rounded-neu-lg p-4 sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_240px_200px]">
        <div className="relative">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference or answer content…"
            aria-label="Search submissions"
            className="neu-input pl-11"
          />
          <Icon.search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300"
          />
          {pending ? (
            <span className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-navy-200 border-t-navy-400" />
          ) : null}
        </div>

        <NeuSelect
          options={[{ value: "all", label: "All forms" }, ...forms.map((form) => ({ value: form.id, label: form.title }))]}
          value={formId}
          onChange={(value) => push({ formId: value })}
          ariaLabel="Filter by form"
        />

        <NeuSelect
          options={STATUSES}
          value={status}
          onChange={(value) => push({ status: value })}
          ariaLabel="Filter by status"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {STATUSES.map((item) => {
          const active = status === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => push({ status: item.value })}
              data-active={active}
              className={cn("neu-chip !py-1.5 !text-[11px]")}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-pill px-1.5 text-[10px] font-bold",
                  active ? "bg-white/25" : "bg-ash-50 text-navy-400",
                )}
              >
                {counts[item.value] ?? 0}
              </span>
            </button>
          );
        })}
        {(formId !== "all" || status !== "all" || query) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              startTransition(() => router.push("/admin/submissions"));
            }}
            className="neu-btn-ghost !py-1.5 !text-[11px]"
          >
            <Icon.close size={12} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
