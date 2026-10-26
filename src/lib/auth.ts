import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserById } from "@/lib/repos/users";
import { hashPassword, verifyPassword } from "@/lib/password";
import { bootstrapAdmin, getEnv, isProduction } from "@/lib/env";

export { hashPassword, verifyPassword };

export const SESSION_COOKIE = "ceyteq_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = { id: string; email: string; name: string; role: string };

const DEV_FALLBACK_SECRET = "ceyteq-digital-race-dev-secret-change-me";

/**
 * Session signing key. Production refuses to sign with a missing, short or
 * placeholder secret rather than degrading to a known value.
 */
function secret() {
  const configured = getEnv().AUTH_SECRET;
  if (configured && configured.length >= 32) return configured;

  if (isProduction()) {
    throw new Error(
      "AUTH_SECRET must be set to at least 32 characters in production (openssl rand -base64 48).",
    );
  }
  return DEV_FALLBACK_SECRET;
}

/* -------------------------------- sessions -------------------------------- */

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload = JSON.stringify({
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as {
      sub: string;
      exp: number;
    };
    if (!payload.sub || payload.exp * 1000 < Date.now()) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

/** Reads the signed session cookie and resolves the admin behind it. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const userId = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const user = await findUserById(userId);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Server-component guard: bounces anonymous visitors to the login screen. */
export async function requireAdmin(nextPath = "/admin") {
  const user = await getSessionUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Route-handler guard: returns a 401 JSON response instead of redirecting. */
export async function requireApiAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: Response.json({ error: "Authentication required." }, { status: 401 }),
    } as const;
  }
  return { user, response: null } as const;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** Bootstrap credentials come from the environment only — no defaults in code. */
export function bootstrapCredentials() {
  return bootstrapAdmin();
}
