import "server-only";

import { createHash } from "node:crypto";
import { formDTO as toDTO, validateSubmission } from "@/lib/forms";
import {
  countSubmissions,
  createSubmission,
  deleteSubmission,
  getSubmissionById,
  listSubmissions as listSubmissionRecords,
  recentSubmissionDates,
  referenceExists,
  submissionStatusCounts,
  updateSubmission,
  type SubmissionRecord,
} from "@/lib/repos/submissions";
import { countForms } from "@/lib/repos/forms";
import type { FormDTO } from "@/lib/types";
import type { FormWithSections } from "@/lib/repos/forms";
import { makeReference } from "@/lib/utils";
import { RATE_LIMITS, consumeRateLimit } from "@/lib/rate-limit";
import { escapeSpreadsheetFormula, sanitizeUserAgent } from "@/lib/sanitize";

export function hashIp(ip: string | null) {
  if (!ip) return null;
  const salt = process.env.AUTH_SECRET || "ceyteq-ip-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export type SubmitInput = {
  data: unknown;
  meta?: {
    company_website?: string;
    elapsedMs?: number;
    startedAt?: number;
  };
  ip?: string | null;
  userAgent?: string | null;
};

export type SubmitResult =
  | { ok: true; reference: string; submissionId: string }
  | {
      ok: false;
      status: number;
      error: string;
      fieldErrors?: Record<string, string>;
      retryAfter?: number;
    };

export async function submitForm(form: FormWithSections, input: SubmitInput): Promise<SubmitResult> {
  const dto: FormDTO = toDTO({ ...form, createdAt: new Date(form.createdAt), updatedAt: new Date(form.updatedAt) });

  if (form.status !== "published") {
    return { ok: false, status: 404, error: "This form is not accepting submissions." };
  }

  // Spam guards: hidden honeypot + implausibly fast completion.
  if (input.meta?.company_website) {
    return { ok: false, status: 400, error: "Submission rejected." };
  }
  if (typeof input.meta?.elapsedMs === "number" && input.meta.elapsedMs < 1200) {
    return {
      ok: false,
      status: 429,
      error: "That was quick! Please review your answers and try again.",
    };
  }

  // Rate limiting — per IP + form (burst) and per IP (sustained).
  const identity = hashIp(input.ip ?? null) ?? "no-ip";
  const [burst, sustained] = await Promise.all([
    consumeRateLimit(`rl:submit:${form.id}:${identity}`, RATE_LIMITS.submissionShort),
    consumeRateLimit(`rl:submit-ip:${identity}`, RATE_LIMITS.submissionLong),
  ]);

  if (!burst.ok || !sustained.ok) {
    const retryAfter = Math.max(burst.retryAfter, sustained.retryAfter, 30);
    return {
      ok: false,
      status: 429,
      error: `Too many submissions from this connection. Please try again in ${Math.ceil(
        retryAfter / 60,
      )} minute(s), or contact us on WhatsApp.`,
      retryAfter,
    };
  }

  const result = validateSubmission(dto, input.data);
  if (!result.ok) {
    return {
      ok: false,
      status: 422,
      error: "Please check the highlighted fields.",
      fieldErrors: result.errors,
    };
  }

  let reference = makeReference();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (!(await referenceExists(reference))) break;
    reference = makeReference();
  }

  const submission = await createSubmission({
    formId: form.id,
    reference,
    data: result.data,
    ipHash: hashIp(input.ip ?? null),
    userAgent: sanitizeUserAgent(input.userAgent ?? null),
  });

  if (!submission) {
    return { ok: false, status: 500, error: "We could not save your submission. Please retry." };
  }

  return { ok: true, reference: submission.reference, submissionId: submission.id };
}

export type SubmissionRow = {
  id: string;
  reference: string;
  status: string;
  notes: string;
  createdAt: string;
  data: Record<string, unknown>;
  formId: string;
  formTitle: string;
  formSlug: string;
};

export async function listSubmissions(options: {
  formId?: string;
  status?: string;
  query?: string;
  take?: number;
}): Promise<SubmissionRow[]> {
  const rows = await listSubmissionRecords(options);

  return rows.map<SubmissionRow>((submission) => ({
    id: submission.id,
    reference: submission.reference,
    status: submission.status,
    notes: submission.notes,
    createdAt: new Date(submission.createdAt).toISOString(),
    data: safeParse(submission.data),
    formId: submission.formId,
    formTitle: submission.formTitle,
    formSlug: submission.formSlug,
  }));
}

function safeParse(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function getSubmission(id: string) {
  const submission = await getSubmissionById(id);
  if (!submission) return null;

  const { getFormById } = await import("@/lib/repos/forms");
  const form = await getFormById(submission.formId);
  if (!form) return null;

  const reviewer = submission.reviewedById
    ? await import("@/lib/repos/users").then((module) => module.findUserById(submission.reviewedById as string))
    : null;

  return {
    id: submission.id,
    reference: submission.reference,
    status: submission.status,
    notes: submission.notes,
    createdAt: new Date(submission.createdAt).toISOString(),
    updatedAt: new Date(submission.updatedAt).toISOString(),
    ipHash: submission.ipHash,
    userAgent: submission.userAgent,
    reviewedBy: reviewer?.name ?? null,
    data: safeParse(submission.data),
    form: toDTO({ ...form, createdAt: new Date(form.createdAt), updatedAt: new Date(form.updatedAt) }),
  };
}

export async function setSubmissionStatus(
  id: string,
  changes: { status?: string; notes?: string; reviewedById?: string | null },
): Promise<SubmissionRecord | null> {
  return updateSubmission(id, changes);
}

export async function removeSubmission(id: string) {
  await deleteSubmission(id);
}

export async function dashboardStats() {
  const [formCount, publishedCount, submissionCount, newCount, dates] = await Promise.all([
    countForms(),
    countForms({ status: "published" }),
    countSubmissions(),
    countSubmissions({ status: "new" }),
    recentSubmissionDates(),
  ]);

  const buckets = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    return {
      label: day.toLocaleDateString("en-GB", { weekday: "short" }),
      date: day.toISOString().slice(0, 10),
      count: dates.filter((date) => date >= day && date < next).length,
    };
  });

  return { formCount, publishedCount, submissionCount, newCount, buckets };
}

export async function submissionCounts() {
  return submissionStatusCounts();
}

export function toCsv(rows: Array<Record<string, unknown>>, columns: Array<{ key: string; label: string }>) {
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const text = Array.isArray(value)
      ? value
          .map((item) =>
            item && typeof item === "object"
              ? `${(item as Record<string, string>).platform ?? ""} ${(item as Record<string, string>).url ?? ""}`.trim()
              : String(item),
          )
          .join(" | ")
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
    // Neutralise CSV/Excel formula injection before quoting.
    const safe = escapeSpreadsheetFormula(text);
    return `"${safe.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  };

  const header = columns.map((column) => escape(column.label)).join(",");
  const body = rows.map((row) => columns.map((column) => escape(row[column.key])).join(","));
  return [header, ...body].join("\r\n");
}

export { countSubmissions };
export { createSubmission };
