"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client.
 *
 * Only ever used for the realtime "change signal" channel. It is created with
 * the public anon key, and `supabase/realtime.sql` restricts that key to the
 * PII-free `ceyteq_signals` table — no lead, client or submission data is
 * reachable from the browser.
 */
export const SIGNAL_TABLE = "ceyteq_signals";

let cached: SupabaseClient | null = null;

export function isRealtimeConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function supabaseBrowser(): SupabaseClient | null {
  if (!isRealtimeConfigured()) return null;
  if (cached) return cached;

  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      realtime: { params: { eventsPerSecond: 4 } },
      global: { headers: { "x-client-info": "ceyteq-control-centre" } },
    },
  );

  return cached;
}
