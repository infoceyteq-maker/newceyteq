"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Props = {
  template?: "restaurant" | "partner" | "blank";
  label: string;
  variant?: "primary" | "default" | "dark";
  className?: string;
  icon?: keyof typeof Icon;
};

export function CreateFormButton({
  template = "blank",
  label,
  variant = "default",
  className,
  icon = "plus",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Glyph = Icon[icon];

  const create = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template }),
      });
      const payload = (await response.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        setError(payload.error ?? "Unable to create the form.");
        setLoading(false);
        return;
      }
      router.push(`/admin/forms/${payload.id}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className={cn("inline-flex flex-col items-start gap-1.5", className)}>
      <button
        type="button"
        onClick={create}
        disabled={loading}
        className={cn(
          "neu-btn w-full",
          variant === "primary" && "neu-btn-primary",
          variant === "dark" && "neu-btn-dark",
        )}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
        ) : (
          <Glyph size={15} />
        )}
        {loading ? "Creating…" : label}
      </button>
      {error ? <span className="text-[11px] font-semibold text-rose-600">{error}</span> : null}
    </div>
  );
}
