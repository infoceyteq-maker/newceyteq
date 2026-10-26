/**
 * Boot-time configuration check.
 *
 * In production an unsafe setup (missing AUTH_SECRET, non-Postgres database)
 * fails loudly here instead of at the first request. Development only logs
 * warnings so local work stays frictionless.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { assertSecureConfiguration, isProduction } = await import("@/lib/env");
  try {
    const messages = assertSecureConfiguration();
    for (const message of messages) {
      if (isProduction()) console.warn(`[config] ${message}`);
      else console.info(`[config] ${message}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    if (isProduction()) throw error;
  }
}
