import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { countUsers, createUser, findUserByEmail, touchLastLogin } from "@/lib/repos/users";
import { bootstrapAdmin } from "@/lib/env";
import { RATE_LIMITS, consumeRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { hashIp } from "@/lib/services/submissions-service";
import { sanitizeEmail, sanitizeSingleLine } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip") ?? null;
}

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { email?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const email = sanitizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400, headers: NO_STORE },
    );
  }

  const identity = hashIp(clientIp(request)) ?? "no-ip";
  const [burst, sustained] = await Promise.all([
    consumeRateLimit(`rl:login:${identity}`, RATE_LIMITS.loginShort),
    consumeRateLimit(`rl:login-ip:${identity}`, RATE_LIMITS.loginLong),
  ]);

  if (!burst.ok || !sustained.ok) {
    const retryAfter = Math.max(burst.retryAfter, sustained.retryAfter, 30);
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(retryAfter) } },
    );
  }

  let user = await findUserByEmail(email);

  /**
   * One-time bootstrap: only when the workspace has zero administrators and the
   * environment supplies matching credentials. There is no built-in password.
   */
  if (!user) {
    const bootstrap = bootstrapAdmin();
    const total = await countUsers();
    if (
      total === 0 &&
      bootstrap.email &&
      bootstrap.password &&
      email === bootstrap.email &&
      password === bootstrap.password
    ) {
      user = await createUser({
        email: bootstrap.email,
        name: sanitizeSingleLine(bootstrap.name, 120),
        passwordHash: await hashPassword(bootstrap.password),
        role: "owner",
      });
      console.warn("[auth] bootstrap administrator created for %s", bootstrap.email);
    }
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    // Identical response for unknown accounts and wrong passwords.
    return NextResponse.json(
      { error: "Those credentials do not match our records." },
      { status: 401, headers: NO_STORE },
    );
  }

  await touchLastLogin(user.id);

  const response = NextResponse.json(
    {
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
    { headers: { ...NO_STORE, ...rateLimitHeaders(burst) } },
  );
  response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
  return response;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed." },
    { status: 405, headers: { ...NO_STORE, Allow: "POST" } },
  );
}
