import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: security headers, CSRF/origin verification and CORS for the
 * API surface.
 *
 * Everything here is intentionally cheap — no database access, no secrets — so
 * it stays well inside the edge request budget.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Hosts that may frame the app (Arena preview + local development). */
const FRAME_ANCESTORS = [
  "'self'",
  "https://*.arena.ai",
  "https://*.e2b.app",
  "https://arena.ai",
];

/**
 * Extra origins permitted to call `/api/*` cross-origin, from `ALLOWED_ORIGINS`
 * (comma separated). Same-origin requests are always allowed.
 */
function configuredOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function hostOf(value: string) {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return "";
  }
}

function originAllowed(origin: string, requestHost: string) {
  const originHost = hostOf(origin);
  if (!originHost) return false;
  if (originHost === requestHost.toLowerCase()) return true;

  const extra = configuredOrigins().map(hostOf);
  if (extra.includes(originHost)) return true;

  // Vercel preview deployments and the sandbox preview proxy.
  if (/\.vercel\.app$/i.test(originHost) || /\.e2b\.app$/i.test(originHost)) return true;

  return false;
}

function contentSecurityPolicy(isProduction: boolean) {
  const directives = [
    "default-src 'self'",
    // Next.js injects inline bootstrap scripts; a nonce pipeline would need to be
    // threaded through every route, so inline is allowed and third-party script
    // origins are blocked outright.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    `frame-ancestors ${FRAME_ANCESTORS.join(" ")}`,
    "base-uri 'self'",
    "object-src 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];
  // Only in production: on http://localhost this would rewrite asset URLs to https.
  if (isProduction) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

function securityHeaders(isProduction: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Security-Policy": contentSecurityPolicy(isProduction),
    "X-Content-Type-Options": "nosniff",
    "X-DNS-Prefetch-Control": "off",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
  if (isProduction) {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }
  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHost = request.headers.get("host") ?? request.nextUrl.host;
  const origin = request.headers.get("origin");
  const isApi = pathname.startsWith("/api/");
  const isProduction = process.env.NODE_ENV === "production";

  /* ----------------------- CSRF / origin verification ---------------------- */
  if (isApi && MUTATING_METHODS.has(request.method)) {
    if (origin && !originAllowed(origin, requestHost)) {
      return NextResponse.json(
        { error: "Request origin is not allowed." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Non-browser clients send no Origin: require a JSON content type so that
    // simple form-encoded cross-site posts cannot reach the handlers.
    if (!origin) {
      const contentType = request.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        return NextResponse.json(
          { error: "Content-Type must be application/json." },
          { status: 415, headers: { "Cache-Control": "no-store" } },
        );
      }
    }
  }

  /* -------------------------- CORS preflight ------------------------------ */
  const corsHeaders: Record<string, string> = {};
  if (isApi && origin && originAllowed(origin, requestHost)) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
    corsHeaders["Access-Control-Allow-Credentials"] = "true";
    corsHeaders["Vary"] = "Origin";
  }

  if (isApi && request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...securityHeaders(isProduction),
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept, X-Requested-With",
        "Access-Control-Max-Age": "600",
        "Cache-Control": "no-store",
      },
    });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(securityHeaders(isProduction))) {
    response.headers.set(key, value);
  }
  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }

  if (isApi) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Run on pages and API routes; skip static assets and image optimisation.
  matcher: ["/((?!_next/static|_next/image|brand/|favicon.ico|robots.txt|sitemap.xml).*)"],
};
