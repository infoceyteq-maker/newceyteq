import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CreateFormButton } from "@/components/admin/CreateFormButton";
import { FormActions } from "@/components/admin/FormActions";
import { listForms } from "@/lib/services/forms-service";
import { relativeTime } from "@/lib/utils";
import { requestOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Forms" };

export default async function AdminFormsPage() {
  const [forms, origin] = await Promise.all([listForms(), requestOrigin()]);
  const published = forms.filter((form) => form.status === "published").length;
  const totalSubmissions = forms.reduce((total, form) => total + form.submissionCount, 0);

  return (
    <div className="space-y-5">
      <header className="neu-raised relative overflow-hidden rounded-neu-lg px-5 py-6 sm:px-8">
        <div className="glow-blob -right-6 -top-10 h-36 w-36 bg-ceyteq-200/60" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
              Dynamic forms
            </p>
            <h1 className="mt-2 text-[26px] font-semibold leading-tight text-navy-700 sm:text-[30px]">
              Form builder
            </h1>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-navy-400">
              Each form is a stored schema with its own public link. Edit the definition and every
              visitor sees the update instantly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="neu-chip !py-1.5 !text-[11px]">
                {forms.length} total · {published} published
              </span>
              <span className="neu-chip !py-1.5 !text-[11px]">{totalSubmissions} submissions</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <CreateFormButton template="restaurant" label="Restaurant template" variant="primary" icon="store" />
            <CreateFormButton template="blank" label="Blank form" icon="plus" />
          </div>
        </div>
      </header>

      {forms.length === 0 ? (
        <div className="neu-raised grid place-items-center rounded-neu-lg px-6 py-16 text-center">
          <span className="neu-orb h-16 w-16 text-ceyteq-500">
            <Icon.forms size={24} />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-navy-700">No forms yet</h2>
          <p className="mt-2 max-w-sm text-[13.5px] text-navy-400">
            Start from the restaurant onboarding template — it already contains all five sections
            from the Digital Race brief.
          </p>
          <div className="mt-6">
            <CreateFormButton template="restaurant" label="Create from template" variant="primary" icon="sparkles" />
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => {
            const url = `${origin}/form/${form.slug}`;
            return (
              <article
                key={form.id}
                className="neu-raised rounded-neu-lg p-5 transition-shadow hover:shadow-neu-lg sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <span className="neu grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-ceyteq-500">
                      <Icon.forms size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/forms/${form.id}`}
                          className="text-[16.5px] font-bold text-navy-700 transition-colors hover:text-ceyteq-600"
                        >
                          {form.title}
                        </Link>
                        <StatusPill status={form.status} />
                      </div>
                      <p className="mt-1 line-clamp-2 max-w-2xl text-[12.5px] leading-relaxed text-navy-300">
                        {form.description || "No description yet."}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-navy-300">
                        <span className="flex items-center gap-1.5">
                          <Icon.link size={12} />
                          /form/{form.slug}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon.layers size={12} />
                          {form.sectionCount} sections · {form.fieldCount} fields
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon.inbox size={12} />
                          {form.submissionCount} submissions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon.clock size={12} />
                          updated {relativeTime(form.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <FormActions id={form.id} slug={form.slug} status={form.status} url={url} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-100/80 text-emerald-700",
    draft: "bg-amber-100/80 text-amber-700",
    archived: "bg-slate-200/80 text-slate-600",
  };
  return <span className={`neu-badge ${map[status] ?? "bg-white/70 text-navy-400"}`}>{status}</span>;
}
