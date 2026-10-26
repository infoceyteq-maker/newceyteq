/**
 * Provision the Ceyteq Digital Race production workspace.
 *
 *   npm run db:seed
 *
 * Creates exactly two things:
 *   1. the administrator account (credentials from the environment)
 *   2. the Restaurant Onboarding form definition
 *
 * No demo or sample submissions are written — the database starts clean.
 */
import { randomBytes } from "node:crypto";

// Load .env when the script is run outside Next.js.
try {
  (process as NodeJS.Process & { loadEnvFile?: (path: string) => void }).loadEnvFile?.(".env");
} catch {
  // No .env file — rely on the process environment.
}

import { hashPassword } from "@/lib/password";
import { createForm, getFormBySlug, type FieldInput } from "@/lib/repos/forms";
import { countUsers, createUser, findUserByEmail } from "@/lib/repos/users";
import { ONBOARDING_TEMPLATE } from "@/lib/templates";
import { bootstrapAdmin, assertSecureConfiguration, isRemoteDatabase } from "@/lib/env";

function keyFor(label: string, index: number) {
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return key || `field_${index + 1}`;
}

function generatePassword() {
  // 24 bytes → 32 url-safe characters of entropy.
  return randomBytes(24).toString("base64url");
}

async function main() {
  const warnings = assertSecureConfiguration();
  for (const warning of warnings) console.warn(`! ${warning}`);

  const databaseUrl = process.env.DATABASE_URL ?? "";
  console.log(
    `• database: ${
      isRemoteDatabase(databaseUrl) ? new URL(databaseUrl).hostname : "embedded PGlite (.data/pglite)"
    }`,
  );

  /* ------------------------------ admin user ----------------------------- */
  const bootstrap = bootstrapAdmin();
  const email = bootstrap.email ?? "admin@ceyteq.com";

  if (!bootstrap.email) {
    console.warn("! ADMIN_EMAIL is not set — defaulting to admin@ceyteq.com");
  }

  const existing = await findUserByEmail(email);
  let generatedPassword: string | null = null;

  if (existing) {
    console.log(`• admin ${email} already exists (left unchanged)`);
  } else {
    const password = bootstrap.password ?? (generatedPassword = generatePassword());
    const admin = await createUser({
      email,
      name: bootstrap.name,
      passwordHash: await hashPassword(password),
      role: "owner",
    });
    if (!admin) throw new Error("Could not create the administrator account.");
    console.log(`• created admin ${email}`);
    if (generatedPassword) {
      console.log("\n  ADMIN_PASSWORD was not set, so a secure password was generated:");
      console.log(`  ${generatedPassword}`);
      console.log("  Store it in your password manager and set ADMIN_PASSWORD for future seeds.\n");
    }
  }

  console.log(`• ${await countUsers()} administrator account(s)`);

  /* -------------------------------- form --------------------------------- */
  const existingForm = await getFormBySlug(ONBOARDING_TEMPLATE.slug);
  if (existingForm) {
    console.log(`• form /form/${existingForm.slug} already exists (left unchanged)`);
  } else {
    const admin = await findUserByEmail(email);
    const form = await createForm({
      slug: ONBOARDING_TEMPLATE.slug,
      title: ONBOARDING_TEMPLATE.title,
      description: ONBOARDING_TEMPLATE.description,
      status: ONBOARDING_TEMPLATE.status,
      submitLabel: ONBOARDING_TEMPLATE.submitLabel,
      successTitle: ONBOARDING_TEMPLATE.successTitle,
      successMessage: ONBOARDING_TEMPLATE.successMessage,
      createdById: admin?.id ?? null,
      sections: ONBOARDING_TEMPLATE.sections.map((section) => ({
        title: section.title,
        description: section.description ?? "",
        icon: section.icon ?? "spark",
        fields: section.fields.map<FieldInput>((field, fieldIndex) => ({
          key: keyFor(field.key ?? field.label, fieldIndex),
          label: field.label,
          type: field.type,
          placeholder: field.placeholder ?? "",
          helpText: field.helpText ?? "",
          required: field.required ?? false,
          options: field.options ?? [],
          config: field.config ?? {},
        })),
      })),
    });
    console.log(`• created form /form/${form.slug} (${form.status})`);
  }

  console.log("\nDone. Sign in at /admin/login with the administrator credentials.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
