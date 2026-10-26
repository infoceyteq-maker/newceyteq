"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { LEAD_STATUSES } from "@/lib/leads";

/** Inline status control + delete for a single lead. */
export function LeadActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = async (next: string) => {
    setBusy(true);
    setError(null);
    const previous = current;
    setCurrent(next);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setCurrent(previous);
        setError(payload.error ?? "Could not update this lead.");
        return;
      }
      router.refresh();
    } catch {
      setCurrent(previous);
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this lead permanently? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? "Could not delete this lead.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor={`lead-status-${id}`}>
        Lead status
      </label>
      <select
        id={`lead-status-${id}`}
        value={current}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
        className="neu-input !w-auto !px-3 !py-1.5 !text-[11.5px] font-semibold"
      >
        {LEAD_STATUSES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        aria-label="Delete lead"
        className="neu-btn h-8 w-8 !px-0 !py-0 text-navy-300 hover:!text-rose-600"
      >
        <Icon.trash size={13} />
      </button>
      {error ? <span className="text-[11px] font-semibold text-rose-600">{error}</span> : null}
    </div>
  );
}
