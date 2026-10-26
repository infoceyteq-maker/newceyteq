import "server-only";

import { z } from "zod";
import { RATE_LIMITS, consumeRateLimit } from "@/lib/rate-limit";
import {
  countLeads,
  createLead,
  deleteLead as deleteLeadRecord,
  getLeadById,
  leadBreakdown,
  listLeadRecords,
  recentLeads,
  updateLead as updateLeadRecord,
} from "@/lib/repos/leads";
import { LEAD_CHANNELS, LEAD_STATUSES, leadChannel } from "@/lib/leads";
import {
  sanitizeEmail,
  sanitizeMultiline,
  sanitizePhone,
  sanitizeSingleLine,
  sanitizeUserAgent,
} from "@/lib/sanitize";
import { hashIp } from "@/lib/services/submissions-service";

export { hashIp };

const channelValues = LEAD_CHANNELS.map((channel) => channel.value) as [string, ...string[]];

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(120, "That name is too long."),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  channel: z.enum(channelValues),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail (10 characters or more).")
    .max(2000, "Please keep the message under 2000 characters."),
});

export type LeadInput = {
  data: unknown;
  meta?: { company_website?: string; elapsedMs?: number };
  ip?: string | null;
  userAgent?: string | null;
};

export type LeadResult =
  | { ok: true; id: string; channel: string }
  | {
      ok: false;
      status: number;
      error: string;
      fieldErrors?: Record<string, string>;
      retryAfter?: number;
    };

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  if (input.meta?.company_website) {
    return { ok: false, status: 400, error: "Submission rejected." };
  }
  if (typeof input.meta?.elapsedMs === "number" && input.meta.elapsedMs < 1000) {
    return { ok: false, status: 429, error: "That was quick — please check your message and try again." };
  }

  const identity = hashIp(input.ip ?? null) ?? "no-ip";
  const [burst, sustained] = await Promise.all([
    consumeRateLimit(`rl:lead:${identity}`, RATE_LIMITS.leadShort),
    consumeRateLimit(`rl:lead-ip:${identity}`, RATE_LIMITS.leadLong),
  ]);

  if (!burst.ok || !sustained.ok) {
    const retryAfter = Math.max(burst.retryAfter, sustained.retryAfter, 30);
    return {
      ok: false,
      status: 429,
      error: `Too many enquiries from this connection. Please try again in ${Math.ceil(
        retryAfter / 60,
      )} minute(s), or message us on WhatsApp.`,
      retryAfter,
    };
  }

  const payload = (input.data ?? {}) as Record<string, unknown>;
  const parsed = leadSchema.safeParse({
    name: sanitizeSingleLine(payload.name, 120),
    email: sanitizeEmail(payload.email),
    phone: sanitizePhone(payload.phone),
    company: sanitizeSingleLine(payload.company, 120),
    channel: sanitizeSingleLine(payload.channel, 40) || "website",
    message: sanitizeMultiline(payload.message, 2000),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, status: 422, error: "Please check the highlighted fields.", fieldErrors };
  }

  const channel = leadChannel(parsed.data.channel);
  const lead = await createLead({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? "",
    company: parsed.data.company ?? "",
    channel: parsed.data.channel,
    source: channel?.source ?? "website",
    message: parsed.data.message,
    ipHash: hashIp(input.ip ?? null),
    userAgent: sanitizeUserAgent(input.userAgent ?? null),
  });

  if (!lead) {
    return { ok: false, status: 500, error: "We could not save your message. Please try again." };
  }

  return { ok: true, id: lead.id, channel: lead.channel };
}

/* ------------------------------ admin create ----------------------------- */

const adminLeadSchema = leadSchema.extend({
  status: z.enum(LEAD_STATUSES.map((status) => status.value) as [string, ...string[]]).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type AdminLeadResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string; fieldErrors?: Record<string, string> };

/**
 * Create a lead from the control centre ("Add lead" quick action).
 *
 * The caller must already be an authenticated admin — this path skips the
 * public anti-spam guards (honeypot, timing, per-IP limits) but keeps the same
 * sanitisation and validation as the public endpoint.
 */
export async function createLeadFromAdmin(input: unknown): Promise<AdminLeadResult> {
  const payload = (input ?? {}) as Record<string, unknown>;
  const parsed = adminLeadSchema.safeParse({
    name: sanitizeSingleLine(payload.name, 120),
    email: sanitizeEmail(payload.email),
    phone: sanitizePhone(payload.phone),
    company: sanitizeSingleLine(payload.company, 120),
    channel: sanitizeSingleLine(payload.channel, 40) || "website",
    message: sanitizeMultiline(payload.message ?? "Added by the Ceyteq team.", 2000),
    status: sanitizeSingleLine(payload.status, 20) || undefined,
    notes: sanitizeMultiline(payload.notes, 2000),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, status: 422, error: "Please check the highlighted fields.", fieldErrors };
  }

  const channel = leadChannel(parsed.data.channel);
  const lead = await createLead({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? "",
    company: parsed.data.company ?? "",
    channel: parsed.data.channel,
    source: channel?.source ?? "website",
    message: parsed.data.message,
    status: parsed.data.status,
    notes: parsed.data.notes ?? "",
    ipHash: null,
    userAgent: "admin-console",
  });

  if (!lead) return { ok: false, status: 500, error: "Could not save the lead. Please try again." };
  return { ok: true, id: lead.id };
}

/* ------------------------------- admin reads ------------------------------ */

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  channel: string;
  source: string;
  message: string;
  status: string;
  notes: string;
  createdAt: string;
};

function toRow(record: Awaited<ReturnType<typeof getLeadById>>): LeadRow | null {
  if (!record) return null;
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    channel: record.channel,
    source: record.source,
    message: record.message,
    status: record.status,
    notes: record.notes,
    createdAt: new Date(record.createdAt).toISOString(),
  };
}

export async function listLeads(options: {
  status?: string;
  channel?: string;
  source?: string;
  query?: string;
  take?: number;
}): Promise<LeadRow[]> {
  const rows = await listLeadRecords(options);
  return rows.map((record) => toRow(record) as LeadRow);
}

export async function getLead(id: string) {
  return toRow(await getLeadById(id));
}

export async function recentLeadRows(take = 5) {
  const rows = await recentLeads(take);
  return rows.map((record) => toRow(record) as LeadRow);
}

export async function leadStats() {
  const [total, newCount, breakdown] = await Promise.all([
    countLeads(),
    countLeads({ status: "new" }),
    leadBreakdown(),
  ]);
  return { total, newCount, ...breakdown };
}

export async function setLeadStatus(
  id: string,
  patch: { status?: string; notes?: string },
) {
  const updated = await updateLeadRecord(id, patch);
  return toRow(updated ?? null);
}

export async function removeLead(id: string) {
  return deleteLeadRecord(id);
}

/** CSV rows for the admin export endpoint (formula-injection safe). */
export async function exportLeads(options: { status?: string; channel?: string; source?: string } = {}) {
  return listLeadRecords({ ...options, take: 5000 });
}
