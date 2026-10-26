"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: "ghost" | "button" | "dark";
  compact?: boolean;
};

export function CopyButton({
  value,
  label = "Copy link",
  copiedLabel = "Copied",
  className,
  variant = "button",
  compact,
}: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const absolute = value.startsWith("/") ? `${window.location.origin}${value}` : value;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absolute);
      } else {
        const area = document.createElement("textarea");
        area.value = absolute;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={cn(
        variant === "ghost" && "neu-btn-ghost inline-flex items-center gap-1.5",
        variant === "button" && "neu-btn !px-4 !py-2 text-[12.5px]",
        variant === "dark" &&
          "inline-flex items-center gap-1.5 rounded-pill bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/20",
        compact && "!px-3 !py-1.5 !text-[11.5px]",
        className,
      )}
      title={value}
    >
      {copied ? <Icon.check size={14} /> : <Icon.copy size={14} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
