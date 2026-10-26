/**
 * Seed the Ceyteq Digital Race workspace.
 *
 *   npm run db:seed
 *
 * Idempotent: re-running only fills in what is missing. Uses the same
 * repository layer as the app, so it works against the embedded PGlite
 * database in development and against Supabase/PostgreSQL in production.
 */
import { hashPassword } from "@/lib/password";
import { createForm, getFormBySlug, type FieldInput } from "@/lib/repos/forms";
import { countSubmissions, createSubmission } from "@/lib/repos/submissions";
import { countUsers, createUser, findUserByEmail } from "@/lib/repos/users";
import { PARTNER_TEMPLATE, RESTAURANT_TEMPLATE, type FormTemplate } from "@/lib/templates";
import { query } from "@/lib/db";

const EMAIL = (process.env.ADMIN_EMAIL || "admin@ceyteq.com").toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || "Ceyteq@2026";
const NAME = process.env.ADMIN_NAME || "Ceyteq Admin";

function keyFor(label: string, index: number) {
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return key || `field_${index + 1}`;
}

async function seedForm(template: FormTemplate, ownerId: string) {
  const existing = await getFormBySlug(template.slug);
  if (existing) {
    console.log(`• form /form/${template.slug} already exists`);
    return existing;
  }

  const form = await createForm({
    slug: template.slug,
    title: template.title,
    description: template.description,
    status: template.status,
    submitLabel: template.submitLabel,
    successTitle: template.successTitle,
    successMessage: template.successMessage,
    createdById: ownerId,
    sections: template.sections.map((section) => ({
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

  console.log(`• created form /form/${form.slug} (${template.status})`);
  return form;
}

function reference(seed: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  let value = seed * 7919 + 104729;
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[value % alphabet.length];
    value = Math.floor(value / 3) + 131 * (i + 3);
  }
  return `CDR-${out.slice(0, 4)}-${out.slice(4)}`;
}

const SAMPLES = [
  {
    data: {
      restaurant_name: "The Lagoon Kitchen",
      location_name: "Marine Drive Branch",
      address: "No. 24, Marine Drive, Colombo 03",
      nearby_city: "Colombo",
      phone_number: "+94 11 234 5678",
      whatsapp_number: "+94 77 123 4567",
      restaurant_email: "hello@lagoonkitchen.lk",
      owner_name: "Nadeesha Perera",
      owner_email: "nadeesha@lagoonkitchen.lk",
      owner_phone: "+94 71 234 5678",
      owner_whatsapp: "+94 71 234 5678",
      social_links: [
        { platform: "google-maps", url: "https://maps.google.com/?q=lagoon+kitchen+colombo" },
        { platform: "instagram", url: "https://instagram.com/lagoonkitchen" },
      ],
      theme_colors: ["ceyteq-blue", "deep-navy", "aqua"],
      special_notes: "Seafood focus. Would love a menu QR code for tables.",
    },
    status: "reviewed",
    daysAgo: 5,
  },
  {
    data: {
      restaurant_name: "Kandy Spice House",
      location_name: "Peradeniya Road",
      address: "112 Peradeniya Road, Kandy",
      nearby_city: "Kandy",
      phone_number: "+94 81 220 1122",
      whatsapp_number: "+94 76 445 8899",
      restaurant_email: "orders@kandyspice.lk",
      owner_name: "Ruwan Silva",
      owner_email: "ruwan@kandyspice.lk",
      owner_phone: "+94 70 112 3344",
      owner_whatsapp: "+94 76 445 8899",
      social_links: [
        { platform: "facebook", url: "https://facebook.com/kandyspicehouse" },
        { platform: "tiktok", url: "https://tiktok.com/@kandyspice" },
        { platform: "tripadvisor", url: "https://tripadvisor.com/kandy-spice-house" },
      ],
      theme_colors: ["sunset", "gold", "deep-navy", "emerald"],
      special_notes: "Two floors, need a delivery radius of 6km.",
    },
    status: "new",
    daysAgo: 2,
  },
  {
    data: {
      restaurant_name: "Galle Fort Bistro",
      location_name: "Church Street",
      address: "18 Church Street, Galle Fort",
      nearby_city: "Galle",
      phone_number: "+94 91 224 5566",
      whatsapp_number: "+94 77 991 2233",
      restaurant_email: "stay@gallefortbistro.lk",
      owner_name: "Amaya Fernando",
      owner_email: "amaya@gallefortbistro.lk",
      owner_phone: "+94 71 556 7788",
      owner_whatsapp: "+94 77 991 2233",
      social_links: [
        { platform: "google-maps", url: "https://maps.google.com/?q=galle+fort+bistro" },
        { platform: "website", url: "https://gallefortbistro.lk" },
      ],
      theme_colors: ["deep-navy", "sky", "rose", "slate", "aqua"],
      special_notes: "",
    },
    status: "new",
    daysAgo: 0,
  },
];

async function seedSubmissions(formId: string) {
  if ((await countSubmissions()) > 0) {
    console.log("• demo submissions already present");
    return;
  }

  for (const [index, sample] of SAMPLES.entries()) {
    const createdAt = new Date(Date.now() - sample.daysAgo * 24 * 60 * 60 * 1000 - index * 3_600_000);
    const submission = await createSubmission({
      formId,
      reference: reference(index + 1),
      data: sample.data,
      ipHash: "demo0000000000000000000000000000",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 Safari/604.1",
    });

    if (submission) {
      await query("update submissions set status = $2, created_at = $3, updated_at = $3 where id = $1", [
        submission.id,
        sample.status,
        createdAt.toISOString(),
      ]);
    }
  }

  console.log(`• seeded ${SAMPLES.length} demo submissions`);
}

async function main() {
  const existing = await findUserByEmail(EMAIL);
  const admin =
    existing ??
    (await createUser({
      email: EMAIL,
      name: NAME,
      passwordHash: await hashPassword(PASSWORD),
      role: "owner",
    }));

  if (!admin) throw new Error("Could not create the admin account.");
  console.log(existing ? `• admin ${EMAIL} already exists` : `• created admin ${EMAIL}`);
  console.log(`• ${await countUsers()} admin account(s) total`);

  const restaurant = await seedForm(RESTAURANT_TEMPLATE, admin.id);
  await seedForm(PARTNER_TEMPLATE, admin.id);
  await seedSubmissions(restaurant.id);

  console.log("\nDone. Sign in with:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${PASSWORD}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
