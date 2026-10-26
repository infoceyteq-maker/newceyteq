"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { LEAD_CHANNELS } from "@/lib/leads";
import { cn } from "@/lib/utils";

type Errors = Record<string, string>;

const CHANNEL_PILLS = LEAD_CHANNELS.filter((channel) =>
  ["instagram", "facebook", "tiktok", "whatsapp", "email", "website"].includes(channel.value),
);

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  channel: "instagram",
  message: "",
};

/**
 * Public enquiry form — feeds the "Social Media Leads & Inquiries" module in the
 * admin dashboard. Same security posture as the onboarding form: honeypot,
 * timing check, server-side sanitisation, validation and rate limiting.
 */
export function LeadForm() {
  const [values, setValues] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const startedAt = useRef(Date.now());

  const update = (key: keyof typeof EMPTY, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setServerError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: values,
          meta: { company_website: honeypot, elapsedMs: Date.now() - startedAt.current },
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Errors;
      };

      if (!response.ok) {
        setErrors(payload.fieldErrors ?? {});
        setServerError(payload.error ?? "We could not send your message. Please try again.");
        setStatus("error");
        return;
      }

      setValues({ ...EMPTY });
      setStatus("done");
      startedAt.current = Date.now();
    } catch {
      setServerError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="neu-sunken rounded-neu p-7 text-center sm:p-9">
        <span className="neon-dot mx-auto mb-5 block" />
        <h3 className="text-[20px] font-bold text-navy-700">Message received</h3>
        <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-navy-400">
          Thank you. Your enquiry is in the Ceyteq inbox under the channel you chose — we reply
          within one working day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="neu-btn mt-6 !py-2.5 !text-[13px]"
        >
          <Icon.plus size={15} className="text-ceyteq-500" />
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {/* honeypot */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="lead_company_website">Company website</label>
        <input
          id="lead_company_website"
          name="lead_company_website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lead_name" className="label">
            Your name
          </label>
          <input
            id="lead_name"
            className={cn("neu-input", errors.name && "neu-input-error")}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            placeholder="Full name"
            aria-invalid={!!errors.name}
            required
          />
          {errors.name ? <p className="mt-1.5 text-[11.5px] font-semibold text-rose-600">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="lead_email" className="label">
            Email
          </label>
          <input
            id="lead_email"
            type="email"
            className={cn("neu-input", errors.email && "neu-input-error")}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            placeholder="name@example.com"
            aria-invalid={!!errors.email}
            required
          />
          {errors.email ? (
            <p className="mt-1.5 text-[11.5px] font-semibold text-rose-600">{errors.email}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="lead_phone" className="label">
            Phone / WhatsApp <span className="normal-case text-navy-300">(optional)</span>
          </label>
          <input
            id="lead_phone"
            type="tel"
            className={cn("neu-input", errors.phone && "neu-input-error")}
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            autoComplete="tel"
            placeholder="+94 XX XXX XXXX"
          />
          {errors.phone ? (
            <p className="mt-1.5 text-[11.5px] font-semibold text-rose-600">{errors.phone}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="lead_company" className="label">
            Business <span className="normal-case text-navy-300">(optional)</span>
          </label>
          <input
            id="lead_company"
            className={cn("neu-input", errors.company && "neu-input-error")}
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
            autoComplete="organization"
            placeholder="Restaurant or business name"
          />
        </div>
      </div>

      <div>
        <span className="label">Where did you find us?</span>
        <div className="flex flex-wrap gap-2">
          {CHANNEL_PILLS.map((channel) => {
            const Glyph = Icon[channel.value as keyof typeof Icon] ?? Icon.globe;
            const active = values.channel === channel.value;
            return (
              <button
                key={channel.value}
                type="button"
                onClick={() => update("channel", channel.value)}
                data-active={active}
                aria-pressed={active}
                className="neu-chip"
              >
                <Glyph size={13} />
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="lead_message" className="label">
          How can we help?
        </label>
        <textarea
          id="lead_message"
          rows={4}
          className={cn("neu-input resize-y", errors.message && "neu-input-error")}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          placeholder="Tell us about your restaurant, your goals and the timeline you have in mind."
          aria-invalid={!!errors.message}
          required
        />
        {errors.message ? (
          <p className="mt-1.5 text-[11.5px] font-semibold text-rose-600">{errors.message}</p>
        ) : null}
      </div>

      {serverError ? (
        <p className="flex items-start gap-2 rounded-2xl bg-rose-50/80 px-4 py-3 text-[12.5px] font-semibold text-rose-700">
          <Icon.alert size={15} className="mt-0.5 shrink-0" />
          {serverError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="neu-btn-neon neu-btn">
          {status === "sending" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              Sending…
            </>
          ) : (
            <>
              Send enquiry
              <Icon.arrowRight size={16} />
            </>
          )}
        </button>
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-navy-300">
          <Icon.shield size={13} className="text-ceyteq-500" />
          Stored securely · never shared
        </p>
      </div>
    </form>
  );
}
