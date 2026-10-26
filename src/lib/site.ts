import "server-only";

import { headers } from "next/headers";

/**
 * The origin the current request arrived on. Used for shareable form links so
 * they always match the host the admin is actually browsing (preview domains,
 * custom domains, localhost) instead of a hard-coded env value.
 */
export async function requestOrigin() {
  try {
    const store = await headers();
    const host = store.get("x-forwarded-host") ?? store.get("host");
    const proto =
      store.get("x-forwarded-proto") ??
      (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https");
    if (host) return `${proto}://${host}`;
  } catch {
    // headers() is unavailable outside a request (e.g. static generation).
  }
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
