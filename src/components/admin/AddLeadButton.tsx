"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { LEAD_CHANNELS, LEAD_STATUSES } from "@/lib/leads";
import { cn } from "@/lib/utils";

type Field = "name" | "email" | "phone" | "company" | "channel" | "status" | "message";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  channel: "instagram",
  status: "new",
  message: "",
};

/**
 * "Add lead" quick action. Posts to the admin-only endpoint
 * (`POST /api/admin/leads`), which validates, sanitises and rate limits the
 * write exactly like the other control-centre mutations.
 */
export function AddLeadButton({
  label = "Add lead",
  variant = "default",
  className,
}: {
  label?: string;
  variant?: "default" | "primary";
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const set = (field: Field, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const close = () => {
    setOpen(false);
    setValues(EMPTY);
    setErrors({});
    setFormError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const response = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!response.ok) {
        setErrors((payload.fieldErrors ?? {}) as Partial<Record<Field, string>>);
        setFormError(payload.error ?? "Could not save the lead.");
        setSaving(false);
        return;
      }
      close();
      setSaving(false);
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "neu-btn !px-4 !py-2.5 !text-[12.5px]",
          variant === "primary" && "neu-btn-primary",
          className,
        )}
      >
        <Icon.plus size={15} className={variant === "primary" ? undefined : "text-ceyteq-500"} />
        {label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto px-3 py-6 sm:px-6">
          <button
            type="button"
            aria-label="Close dialog"
            onClick={close}
            className="fixed inset-0 bg-navy-800/40 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-lead-title"
            className="animate-fade-up neu relative w-full max-w-xl rounded-neu-lg p-5 sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ceyteq-500">
                  <span className="neon-dot" />
                  Pipeline
                </p>
                <h2 id="add-lead-title" className="mt-1.5 text-[19px] font-bold text-navy-700">
                  Add a lead
                </h2>
                <p className="mt-1 text-[12.5px] text-navy-400">
                  Log an enquiry that arrived outside the website form.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="neu-btn h-9 w-9 shrink-0 !px-0"
              >
                <Icon.close size={15} />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Name *</span>
                  <input
                    value={values.name}
                    onChange={(event) => set("name", event.target.value)}
                    className={cn("neu-input !py-2.5 !text-[13.5px]", errors.name && "neu-input-error")}
                    placeholder="Contact name"
                    autoComplete="off"
                    required
                  />
                  {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
                </label>
                <label className="block">
                  <span className="label">Email *</span>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(event) => set("email", event.target.value)}
                    className={cn("neu-input !py-2.5 !text-[13.5px]", errors.email && "neu-input-error")}
                    placeholder="name@venue.lk"
                    autoComplete="off"
                    required
                  />
                  {errors.email ? <ErrorText>{errors.email}</ErrorText> : null}
                </label>
                <label className="block">
                  <span className="label">Phone</span>
                  <input
                    value={values.phone}
                    onChange={(event) => set("phone", event.target.value)}
                    className="neu-input !py-2.5 !text-[13.5px]"
                    placeholder="+94 7X XXX XXXX"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="label">Business</span>
                  <input
                    value={values.company}
                    onChange={(event) => set("company", event.target.value)}
                    className="neu-input !py-2.5 !text-[13.5px]"
                    placeholder="Restaurant or venue"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="label">Channel</span>
                  <select
                    value={values.channel}
                    onChange={(event) => set("channel", event.target.value)}
                    className="neu-input !py-2.5 !text-[13.5px]"
                  >
                    {LEAD_CHANNELS.map((channel) => (
                      <option key={channel.value} value={channel.value}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label">Status</span>
                  <select
                    value={values.status}
                    onChange={(event) => set("status", event.target.value)}
                    className="neu-input !py-2.5 !text-[13.5px]"
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="label">Message</span>
                <textarea
                  value={values.message}
                  onChange={(event) => set("message", event.target.value)}
                  rows={3}
                  className={cn(
                    "neu-input resize-none !py-2.5 !text-[13.5px]",
                    errors.message && "neu-input-error",
                  )}
                  placeholder="What did they ask for?"
                />
                {errors.message ? <ErrorText>{errors.message}</ErrorText> : null}
              </label>

              {formError ? (
                <p className="neu-inset-card flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[12px] font-semibold text-rose-600">
                  <Icon.alert size={14} />
                  {formError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2.5 pt-1">
                <button type="button" onClick={close} className="neu-btn !px-4 !py-2.5 !text-[12.5px]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="neu-btn neu-btn-primary !px-5 !py-2.5 !text-[12.5px]"
                >
                  {saving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Icon.check size={15} />
                  )}
                  {saving ? "Saving…" : "Save lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <span className="mt-1 block text-[11px] font-semibold text-rose-600">{children}</span>;
}
