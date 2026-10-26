"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { SIGNAL_TABLE, isRealtimeConfigured, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type State = "idle" | "connecting" | "live" | "offline";

/**
 * Realtime bridge for the control centre.
 *
 * Subscribes to INSERTs on the PII-free `ceyteq_signals` table and re-renders
 * the current server component tree when something changes (new client, lead,
 * submission or form edit). All actual data still comes from authenticated
 * server components — the signal is only a refresh ping.
 *
 * Falls back gracefully to a manual refresh when Supabase is not configured.
 */
export function LiveSignal({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<State>(isRealtimeConfigured() ? "connecting" : "offline");
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<number | null>(null);

  const refresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 900);
  }, [router]);

  useEffect(() => {
    const client = supabaseBrowser();
    if (!client) {
      setState("offline");
      return;
    }

    const channel = client
      .channel("ceyteq-control-centre")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: SIGNAL_TABLE },
        () => {
          /* Debounce bursts (a form save often writes several rows). */
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => {
            setRefreshing(true);
            router.refresh();
            window.setTimeout(() => setRefreshing(false), 900);
          }, 600);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setState("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setState("offline");
        else setState("connecting");
      });

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      void client.removeChannel(channel);
    };
  }, [router]);

  const live = state === "live";
  const label = live ? "Live sync" : state === "connecting" ? "Connecting…" : "Manual refresh";

  return (
    <button
      type="button"
      onClick={refresh}
      title={
        live
          ? "Live — the dashboard refreshes as soon as data changes"
          : "Refresh this dashboard manually (connect Supabase for live sync)"
      }
      aria-label={label}
      className={cn(
        "group inline-flex items-center gap-2 rounded-pill bg-ash-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-navy-300 shadow-neu-inset-sm transition-all duration-250 hover:-translate-y-0.5 hover:text-navy-600",
        compact && "justify-center px-2",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          live
            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            : state === "connecting"
              ? "animate-pulse bg-ceyteq-neon shadow-neon-sm"
              : "bg-navy-200",
        )}
      />
      {compact ? null : <span className="truncate">{label}</span>}
      <Icon.bolt
        size={11}
        className={cn("shrink-0", refreshing ? "text-ceyteq-500" : "text-navy-200", "transition-colors")}
      />
    </button>
  );
}
