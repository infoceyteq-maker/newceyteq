import { isRemoteDatabase } from "@/lib/env";
import { databaseInfo, one } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe for uptime monitoring.
 * Never returns secrets — only driver, latency and schema readiness.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const [schema, info] = await Promise.all([
      one<{ forms: number; submissions: number }>(
        `select (select count(*)::int from forms) as forms,
                (select count(*)::int from submissions) as submissions`,
      ),
      databaseInfo(),
    ]);

    return Response.json(
      {
        status: "ok",
        database: {
          driver: info.driver,
          remote: isRemoteDatabase(process.env.DATABASE_URL),
          engine: info.version?.split(" on ")[0] ?? null,
          latencyMs: Date.now() - startedAt,
        },
        schema: {
          forms: Number(schema?.forms ?? 0),
          submissions: Number(schema?.submissions ?? 0),
        },
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("[health] database check failed:", error);
    return Response.json(
      { status: "degraded", error: "Database unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
