import { NextResponse } from "next/server";
import {
  countUsers,
  createUser,
  findUserByEmail,
  touchLastLogin,
} from "@/lib/repos/users";
import {
  SESSION_COOKIE,
  bootstrapCredentials,
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/auth";
import { checkRateLimit, hashIp } from "@/lib/services/submissions-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(`login:${hashIp(ip) ?? ip}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let user = await findUserByEmail(email);

  // First-run bootstrap: if no admin exists yet and the env credentials match,
  // create the account on the fly so a fresh deployment is usable immediately.
  if (!user) {
    const total = await countUsers();
    const bootstrap = bootstrapCredentials();
    if (total === 0 && email === bootstrap.email && password === bootstrap.password) {
      user = await createUser({
        email: bootstrap.email,
        name: bootstrap.name,
        passwordHash: await hashPassword(bootstrap.password),
        role: "owner",
      });
    }
  }

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Those credentials do not match our records." }, { status: 401 });
  }

  await touchLastLogin(user.id);

  const response = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
  return response;
}
