"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { FieldRenderer } from "@/components/form/fields";
import { cn } from "@/lib/utils";
import type { FormDTO, SubmissionValue } from "@/lib/types";
import { CONTACT, CONTACT_CHANNELS } from "@/lib/site-config";

const HOTLINE_DISPLAY =
  CONTACT_CHANNELS.find((channel) => channel.id === "hotline")?.value ?? "+94 78 860 7143";

type Props = {
  form: FormDTO;
  preview?: boolean;
};

type Errors = Record<string, string>;

const REQUIRED_TOTAL = (form: FormDTO) =>
  form.sections.reduce(
    (total, section) => total + section.fields.filter((field) => field.required).length,
    0,
  );

function isFilled(value: SubmissionValue | undefined) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return true;
  if (Array.isArray(value)) {
    if (value.length === 0) return false;
    return value.some((item) =>
      typeof item === "string"
        ? item.trim().length > 0
        : item && typeof item === "object"
          ? String((item as { url?: string }).url ?? "").trim().length > 0
          : false,
    );
  }
  return false;
}

function initialValues(form: FormDTO): Record<string, SubmissionValue> {
  // Repeatable link fields start with one ready-to-fill row.
  const initial: Record<string, SubmissionValue> = {};
  for (const section of form.sections) {
    for (const field of section.fields) {
      if (field.type === "links") {
        initial[field.key] = [{ platform: field.options[0]?.value ?? "", url: "" }];
      }
    }
  }
  return initial;
}

export function DynamicForm({ form, preview = false }: Props) {
  const [values, setValues] = useState<Record<string, SubmissionValue>>(() => initialValues(form));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  const totalRequired = useMemo(() => REQUIRED_TOTAL(form), [form]);
  const completedRequired = useMemo(() => {
    let count = 0;
    for (const section of form.sections) {
      for (const field of section.fields) {
        if (field.required && isFilled(values[field.key])) count += 1;
      }
    }
    return count;
  }, [form, values]);

  const progress = totalRequired === 0 ? 100 : Math.round((completedRequired / totalRequired) * 100);

  const setValue = useCallback((key: string, value: SubmissionValue) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const firstErrorKey = (nextErrors: Errors) => {
    for (const section of form.sections) {
      for (const field of section.fields) {
        if (nextErrors[field.key]) return field.key;
      }
    }
    return null;
  };

  const focusField = (key: string | null) => {
    if (!key) return;
    const node = formRef.current?.querySelector<HTMLElement>(`[data-field-key="${key}"]`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = node?.querySelector<HTMLElement>("input, textarea, select, button");
    window.setTimeout(() => focusable?.focus({ preventScroll: true }), 320);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const element = event.currentTarget;
    const honeypot = (element.elements.namedItem("company_website") as HTMLInputElement | null)?.value;

    // Client-side mirror of the server validation for instant feedback.
    const clientErrors: Errors = {};
    for (const section of form.sections) {
      for (const field of section.fields) {
        const value = values[field.key];
        const filled = isFilled(value);
        if (field.required && !filled) {
          clientErrors[field.key] =
            field.type === "color-multi"
              ? "Select at least one colour."
              : field.type === "links"
                ? "Add at least one link."
                : `${field.label} is required.`;
        }
        if (filled && field.type === "email" && typeof value === "string") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
            clientErrors[field.key] = "Enter a valid email address.";
          }
        }
        if (filled && field.type === "links" && Array.isArray(value)) {
          const incomplete = value.some((row) => {
            const record = row as { platform?: string; url?: string };
            return !record.platform || !record.url?.trim();
          });
          if (incomplete) clientErrors[field.key] = "Every link needs a platform and a URL.";
        }
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setServerError(null);
      focusField(firstErrorKey(clientErrors));
      return;
    }

    setStatus("submitting");
    setServerError(null);

    try {
      const response = await fetch(`/api/forms/${form.slug}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: values,
          meta: {
            company_website: honeypot ?? "",
            startedAt: startedAt.current,
            elapsedMs: Date.now() - startedAt.current,
          },
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        reference?: string;
        fieldErrors?: Errors;
        error?: string;
      };

      if (!response.ok) {
        if (payload.fieldErrors) {
          setErrors(payload.fieldErrors);
          focusField(firstErrorKey(payload.fieldErrors));
        }
        setServerError(payload.error || "We could not submit the form. Please try again.");
        setStatus("error");
        return;
      }

      setReference(payload.reference ?? null);
      setStatus("done");
      setValues(initialValues(form));
      setErrors({});
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setServerError("Network error — check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="neu-raised animate-fade-up relative overflow-hidden rounded-neu-lg p-8 text-center sm:p-12">
          <div className="glow-blob left-1/2 top-0 h-40 w-64 -translate-x-1/2 bg-ash-50" />
          <div className="relative">
            <div className="relative mx-auto grid h-24 w-24 place-items-center">
              <span className="absolute inset-0 rounded-full bg-ceyteq-500/20 animate-pulse-ring" />
              <span className="neu-blue relative grid h-20 w-20 place-items-center rounded-full text-white">
                <Icon.check size={34} strokeWidth={2.6} />
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-navy-700 sm:text-3xl">{form.successTitle}</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14.5px] leading-relaxed text-navy-400">
              {form.successMessage}
            </p>
            {reference ? (
              <div className="neu-sunken mx-auto mt-6 inline-flex flex-col items-center rounded-2xl px-6 py-3">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">
                  Reference
                </span>
                <span className="font-display text-lg font-bold tracking-[0.08em] text-navy-600">
                  {reference}
                </span>
              </div>
            ) : null}
            <p className="mx-auto mt-4 max-w-md text-[12.5px] font-semibold text-navy-300">
              Need to add something? Reach us directly —{" "}
              <a href={CONTACT.hotlineTel} className="text-ceyteq-600 hover:underline">
                {HOTLINE_DISPLAY}
              </a>{" "}
              or{" "}
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ceyteq-600 hover:underline"
              >
                WhatsApp
              </a>
              .
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="neu-btn w-full sm:w-auto"
              >
                <Icon.whatsapp size={16} className="text-ceyteq-500" />
                Chat on WhatsApp
              </a>
              <a href={CONTACT.hotlineTel} className="neu-btn w-full sm:w-auto">
                <Icon.phone size={16} className="text-ceyteq-500" />
                {HOTLINE_DISPLAY}
              </a>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setReference(null);
                  startedAt.current = Date.now();
                }}
                className="neu-btn w-full !bg-none !shadow-neu sm:w-auto"
              >
                Submit another response
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Section rail — a single horizontal strip so the form reads top to bottom. */}
      <nav
        aria-label="Form sections"
        className="neu no-scrollbar mb-5 flex items-center gap-2 overflow-x-auto rounded-[22px] p-2"
      >
        {form.sections.map((section, index) => {
          const complete = section.fields.every((field) => !field.required || isFilled(values[field.key]));
          return (
            <a
              key={section.id}
              href={`#section-${index + 1}`}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[11.5px] font-semibold transition-colors",
                complete
                  ? "bg-ceyteq-500/10 text-ceyteq-700"
                  : "text-navy-400 hover:bg-ash-100 hover:text-navy-600",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px]",
                  complete ? "bg-ceyteq-500 text-white shadow-glow" : "neu-inset text-navy-300",
                )}
              >
                {complete ? <Icon.check size={10} strokeWidth={3} /> : index + 1}
              </span>
              <span className="whitespace-nowrap">{section.title}</span>
            </a>
          );
        })}
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 pl-3 pr-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy-300 sm:flex">
          <Icon.shield size={12} className="text-ceyteq-500" />
          Secure
        </span>
      </nav>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="min-w-0 space-y-6 sm:space-y-8">
        {/* honeypot: hidden from humans and assistive tech */}
        <div aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor="company_website">Company website</label>
          <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
        </div>

        {form.sections.map((section, sectionIndex) => (
          <section
            key={section.id}
            id={`section-${sectionIndex + 1}`}
            className="neu-3d scroll-mt-24 rounded-neu-lg p-5 sm:p-7"
          >
            <header className="mb-5 flex items-start gap-3.5 sm:mb-6 sm:gap-4">
              <span className="neu grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-ceyteq-500 sm:h-14 sm:w-14">
                <span className="sr-only">Section {sectionIndex + 1}:</span>
                <SectionGlyph name={section.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="neu-badge bg-ash-100 text-navy-400">
                    Step {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-lg font-bold text-navy-700 sm:text-xl">{section.title}</h2>
                </div>
                {section.description ? (
                  <p className="mt-1 text-[13px] leading-relaxed text-navy-300">{section.description}</p>
                ) : null}
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  data-field-key={field.key}
                  className={cn(
                    "scroll-mt-28 sm:col-span-2",
                    field.type === "color-multi" ||
                      field.type === "links" ||
                      field.type === "textarea" ||
                      field.config.width !== "half"
                      ? "sm:col-span-2"
                      : "sm:col-span-1",
                  )}
                >
                  <FieldRenderer
                    field={field}
                    value={values[field.key]}
                    onChange={(value) => setValue(field.key, value)}
                    error={errors[field.key]}
                    disabled={status === "submitting"}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {serverError ? (
          <div
            role="alert"
            className="neu flex items-start gap-3 rounded-2xl border-rose-200/70 p-4 text-[13.5px] font-semibold text-rose-600"
          >
            <Icon.alert size={18} className="mt-0.5 shrink-0" />
            <div>
              <p>{serverError}</p>
              <p className="mt-1 text-[12px] font-medium text-navy-300">
                Nothing was lost — your answers are still in the form.
              </p>
            </div>
          </div>
        ) : null}

        <div className="neu-3d rounded-neu-lg p-5 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <div className="mb-2 flex items-center justify-between text-[11.5px] font-bold uppercase tracking-[0.12em] text-navy-300">
                <span>Progress</span>
                <span className="text-navy-500">{progress}%</span>
              </div>
              <div className="neu-sunken h-3 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#0072CE,#00D2FF)] shadow-[0_0_14px_rgba(0, 210, 255,0.6)] transition-[width] duration-500"
                  style={{ width: `${Math.max(progress, 4)}%` }}
                />
              </div>
              <p className="mt-2 text-[11.5px] text-navy-300">
                {completedRequired} of {totalRequired} required details complete
              </p>
            </div>

            <div className="flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:items-center">
              {preview ? (
                <span className="neu-badge justify-center bg-amber-100/70 text-amber-700">
                  Preview — submissions are disabled
                </span>
              ) : null}
              <button
                type="submit"
                disabled={status === "submitting" || preview}
                className="neu-btn-neon neu-btn group relative w-full overflow-hidden !px-8 !py-4 text-[14.5px] sm:w-auto"
              >
                <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(0, 210, 255,0.4),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2.5">
                  {status === "submitting" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      {form.submitLabel}
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-ceyteq-neon text-navy-800 shadow-[0_0_16px_rgba(0, 210, 255,0.75)]">
                        <Icon.arrowRight size={15} />
                      </span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="px-2 text-center text-[11.5px] leading-relaxed text-navy-300">
          Submitted securely to Ceyteq. We never share your details with third parties.
        </p>
      </form>

    </div>
  );
}

function SectionGlyph({ name }: { name: string }) {
  const map: Record<string, keyof typeof Icon> = {
    store: "store",
    user: "user",
    link: "link",
    palette: "palette",
    notes: "notes",
    spark: "spark",
    phone: "phone",
    mail: "mail",
    globe: "globe",
    shield: "shield",
  };
  const Glyph = Icon[map[name] ?? "spark"];
  return <Glyph size={22} />;
}
