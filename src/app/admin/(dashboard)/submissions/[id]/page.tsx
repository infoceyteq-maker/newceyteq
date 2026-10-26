import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, PLATFORM_ICONS } from "@/components/icons";
import { SubmissionReview } from "@/components/admin/SubmissionReview";
import { CopyButton } from "@/components/ui/CopyButton";
import { getSubmission } from "@/lib/services/submissions-service";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Submission" };

function isLinkRow(item: unknown): item is { platform: string; url: string } {
  return (
    !!item &&
    typeof item === "object" &&
    typeof (item as { platform?: string }).platform === "string" &&
    typeof (item as { url?: string }).url === "string"
  );
}

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const sections = submission.form.sections;
  const flatFields = sections.flatMap((section) =>
    section.fields.map((field) => ({ ...field, sectionTitle: section.title })),
  );
  const orphanAnswers = Object.entries(submission.data).filter(
    ([key]) => !flatFields.some((field) => field.key === key),
  );

  const statusStyles: Record<string, string> = {
    new: "bg-ceyteq-100/90 text-ceyteq-700",
    reviewed: "bg-emerald-100/80 text-emerald-700",
    archived: "bg-ash-100 text-navy-400 shadow-neu-inset-sm",
  };

  return (
    <div className="space-y-5">
      <div className="neu-raised rounded-neu-lg px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/submissions" aria-label="Back" className="neu-btn h-10 w-10 !px-0">
              <Icon.arrowLeft size={16} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[15px] font-bold tracking-[0.06em] text-navy-700">
                  {submission.reference}
                </span>
                <span className={`neu-badge ${statusStyles[submission.status] ?? "bg-ash-100 text-navy-400"}`}>
                  {submission.status}
                </span>
              </div>
              <p className="mt-1 text-[11.5px] font-semibold text-navy-300">
                {submission.form.title} · received {formatDateTime(submission.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton value={submission.reference} label={submission.reference} copiedLabel="Copied" compact />
            <Link
              href={`/form/${submission.form.slug}`}
              target="_blank"
              className="neu-btn !px-3.5 !py-2 !text-[12px]"
            >
              <Icon.external size={13} />
              View form
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0 space-y-4">
          {sections.map((section, sectionIndex) => (
            <section key={section.id} className="neu-raised rounded-neu-lg p-5 sm:p-6">
              <header className="flex items-center gap-3">
                <span className="neu-orb h-10 w-10 text-ceyteq-500">
                  <Icon.spark size={16} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-300">
                    Section {String(sectionIndex + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-[15px] font-bold text-navy-700">{section.title}</h2>
                </div>
              </header>

              <dl className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {section.fields.map((field) => {
                  const value = submission.data[field.key];
                  const empty =
                    value === undefined ||
                    value === null ||
                    (typeof value === "string" && value.trim() === "") ||
                    (Array.isArray(value) && value.length === 0);

                  const isLinks = Array.isArray(value) && value.every(isLinkRow) && value.length > 0;
                  const isColours =
                    field.type === "color-multi" && Array.isArray(value) && value.length > 0;

                  return (
                    <div
                      key={field.id}
                      className={`neu-sunken rounded-2xl px-4 py-3 ${
                        field.type === "textarea" || isLinks || isColours ? "sm:col-span-2" : ""
                      }`}
                    >
                      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-navy-300">
                        {field.label}
                      </dt>
                      <dd className="mt-1.5 text-[13.5px] font-semibold leading-relaxed text-navy-600">
                        {empty ? (
                          <span className="text-navy-300">Not provided</span>
                        ) : isLinks ? (
                          <ul className="space-y-1.5">
                            {(value as Array<{ platform: string; url: string }>).map((row, index) => {
                              const iconName = PLATFORM_ICONS[row.platform] ?? "globe";
                              const Glyph = Icon[iconName];
                              const platformLabel =
                                field.options.find((option) => option.value === row.platform)?.label ??
                                row.platform;
                              return (
                                <li key={index} className="flex items-center gap-2">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-ash-100 text-ceyteq-500">
                                    <Glyph size={12} />
                                  </span>
                                  <span className="text-[11.5px] font-bold text-navy-500">
                                    {platformLabel}
                                  </span>
                                  <a
                                    href={row.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="min-w-0 flex-1 truncate text-[12px] font-medium text-ceyteq-600 hover:underline"
                                  >
                                    {row.url}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        ) : isColours ? (
                          <ul className="flex flex-wrap gap-2">
                            {(value as string[]).map((colourValue) => {
                              const option = field.options.find((item) => item.value === colourValue);
                              return (
                                <li
                                  key={colourValue}
                                  className="flex items-center gap-1.5 rounded-pill bg-ash-100 px-2 py-1 text-[11px] font-semibold text-navy-500"
                                >
                                  <span
                                    className="h-3.5 w-3.5 rounded-full ring-1 ring-white/70"
                                    style={{ background: option?.swatch ?? "#8C9BB0" }}
                                  />
                                  {option?.label ?? colourValue}
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <span className="whitespace-pre-wrap">{String(value)}</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          ))}

          {orphanAnswers.length > 0 ? (
            <section className="neu rounded-neu-lg p-5">
              <h2 className="flex items-center gap-2 text-[13.5px] font-bold text-navy-600">
                <Icon.alert size={15} className="text-amber-500" />
                Answers without a current field
              </h2>
              <p className="mt-1 text-[11.5px] text-navy-300">
                These keys were captured before the form definition changed.
              </p>
              <dl className="mt-3 space-y-1.5">
                {orphanAnswers.map(([key, value]) => (
                  <div key={key} className="neu-sunken rounded-xl px-3 py-2">
                    <dt className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-navy-300">
                      {key}
                    </dt>
                    <dd className="text-[12.5px] font-semibold text-navy-500">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-[104px]">
          <SubmissionReview
            id={submission.id}
            status={submission.status}
            notes={submission.notes}
          />

          <div className="neu rounded-neu-lg p-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">Metadata</p>
            <dl className="mt-3 space-y-2.5 text-[11.5px]">
              {[
                { label: "Form", value: submission.form.title },
                { label: "Slug", value: `/form/${submission.form.slug}` },
                { label: "Received", value: formatDateTime(submission.createdAt) },
                { label: "Last updated", value: formatDateTime(submission.updatedAt) },
                { label: "Reviewed by", value: submission.reviewedBy ?? "—" },
                { label: "IP hash", value: submission.ipHash ? `${submission.ipHash.slice(0, 12)}…` : "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 font-semibold text-navy-300">{item.label}</dt>
                  <dd className="min-w-0 truncate text-right font-semibold text-navy-500">{item.value}</dd>
                </div>
              ))}
            </dl>
            {submission.userAgent ? (
              <p className="mt-3 line-clamp-3 rounded-lg bg-ash-100 px-2.5 py-2 text-[10px] font-medium leading-relaxed text-navy-300">
                {submission.userAgent}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
