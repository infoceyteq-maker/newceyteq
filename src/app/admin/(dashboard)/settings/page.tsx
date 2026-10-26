import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { countForms } from "@/lib/services/forms-service";
import { countSubmissions } from "@/lib/services/submissions-service";
import { databaseInfo } from "@/lib/db";
import { countUsers } from "@/lib/repos/users";
import { formatDateTime, initials } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireAdmin();
  const [formCount, submissionCount, adminCount, db] = await Promise.all([
    countForms(),
    countSubmissions(),
    countUsers(),
    databaseInfo(),
  ]);

  const isRemote = db.driver === "node-postgres";
  const database = isRemote
    ? `PostgreSQL · ${db.host ?? "remote"}`
    : "PGlite (embedded PostgreSQL)";

  return (
    <div className="space-y-5">
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8">
        <div className="glow-blob -right-8 -top-12 h-40 w-40 bg-ceyteq-200/60" />
        <div className="relative flex items-center gap-4">
          <span className="neu grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(150deg,#123a5c,#082b49)] text-[16px] font-bold text-white">
            {initials(user.name)}
          </span>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
              Workspace settings
            </p>
            <h1 className="mt-1 text-[24px] font-semibold leading-tight text-navy-700 sm:text-[28px]">
              {user.name}
            </h1>
            <p className="text-[12.5px] font-semibold text-navy-300">
              {user.email} · {user.role}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy-700">
            <Icon.shield size={16} className="text-ceyteq-500" />
            Security
          </h2>
          <dl className="mt-4 space-y-3 text-[12.5px]">
            {[
              { label: "Password hashing", value: "scrypt · 64-byte key · per-user salt" },
              { label: "Session", value: "HMAC-SHA256 signed, HttpOnly, SameSite=Lax" },
              { label: "Session lifetime", value: "7 days" },
              { label: "Submission validation", value: "Zod schema generated from the form definition" },
              { label: "Abuse protection", value: "Honeypot + timing check + per-IP throttle" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5 border-t border-white/50 pt-2.5 first:border-0 first:pt-0">
                <dt className="font-bold uppercase tracking-[0.08em] text-navy-300 text-[10px]">
                  {item.label}
                </dt>
                <dd className="font-semibold text-navy-500">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="neu-raised rounded-neu-lg p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy-700">
            <Icon.layers size={16} className="text-ceyteq-500" />
            Data layer
          </h2>
          <dl className="mt-4 space-y-3 text-[12.5px]">
            {[
              { label: "Provider", value: database },
              { label: "ORM", value: "Prisma 6 · portable schema" },
              { label: "Forms", value: String(formCount) },
              { label: "Sections / fields", value: "form_sections → form_fields" },
              { label: "Submissions", value: String(submissionCount) },
              { label: "Admin accounts", value: String(adminCount) },
              { label: "Engine", value: db.version?.split(" on ")[0] ?? "unknown" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5 border-t border-white/50 pt-2.5 first:border-0 first:pt-0">
                <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy-300">
                  {item.label}
                </dt>
                <dd className="font-semibold text-navy-500">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-xl bg-white/55 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-navy-300">
              {isRemote ? "Supabase / PostgreSQL connected" : "Connect Supabase"}
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy-400">
              {isRemote
                ? "Queries run through node-postgres against your managed PostgreSQL instance. Apply db/schema.sql when you provision a new database."
                : "Development uses an embedded PostgreSQL (PGlite). Point DATABASE_URL at your Supabase pooler connection string to switch instantly — the schema is identical."}
            </p>
            <code className="mt-2 block overflow-x-auto rounded-lg bg-navy-700/90 px-3 py-2 font-mono text-[10.5px] text-ceyteq-200">
              DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-[region].pooler.supabase.com:6543/postgres
            </code>
          </div>
        </section>

        <section className="neu-raised rounded-neu-lg p-5 sm:p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy-700">
            <Icon.sparkles size={16} className="text-ceyteq-500" />
            Form templates
          </h2>
          <p className="mt-1 text-[12.5px] text-navy-400">
            The production template lives in{" "}
            <code className="font-mono text-[11.5px]">src/lib/templates.ts</code> and is provisioned by{" "}
            <code className="font-mono text-[11.5px]">npm run db:seed</code>.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map((template) => (
              <div key={template.slug} className="neu rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-bold text-navy-600">{template.name}</p>
                  <span className="neu-badge bg-white/70 text-navy-400">{template.status}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-navy-300">{template.description}</p>
                <p className="mt-2 font-mono text-[10.5px] font-semibold text-ceyteq-600">
                  /form/{template.slug}
                </p>
                <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-navy-300">
                  {template.sections.length} sections ·{" "}
                  {template.sections.reduce((total, section) => total + section.fields.length, 0)} fields
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="neu rounded-neu-lg p-5 sm:p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-navy-700">
            <Icon.code size={16} className="text-ceyteq-500" />
            Useful commands
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              ["npm run dev", "Start the development server"],
              ["npm run db:seed", "Provision admin + onboarding form"],
              ["npm run db:stats", "Inspect the database contents"],
              ["npm run logo", "Regenerate the transparent logo assets"],
            ].map(([command, description]) => (
              <div key={command} className="flex items-center gap-2.5 rounded-xl bg-white/55 px-3 py-2.5">
                <code className="font-mono text-[11px] font-bold text-navy-600">{command}</code>
                <span className="text-[11px] font-medium text-navy-300">{description}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] font-semibold text-navy-300">
            Workspace created {formatDateTime(new Date())} · Ceyteq Digital Race v1.0
          </p>
        </section>
      </div>
    </div>
  );
}
