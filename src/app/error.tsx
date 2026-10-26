"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/ui/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Ceyteq Digital Race error:", error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo height={44} />
        </div>
        <div className="neu-raised rounded-neu-lg p-8 text-center sm:p-10">
          <div className="neu mx-auto grid h-16 w-16 place-items-center rounded-2xl text-amber-500">
            <Icon.alert size={26} />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-700">Something slipped</h1>
          <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-navy-400">
            An unexpected error interrupted that request. Your data is safe — try again, or head
            back to the dashboard.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-[11px] font-semibold text-navy-300">
              ref: {error.digest}
            </p>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={reset} className="neu-btn-primary neu-btn">
              <Icon.bolt size={15} />
              Try again
            </button>
            <Link href="/admin" className="neu-btn">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
