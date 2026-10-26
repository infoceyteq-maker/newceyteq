import { z } from "zod";
import type {
  FieldConfig,
  FieldOption,
  FieldType,
  FormDTO,
  FormFieldDTO,
  FormSectionDTO,
  LinkValue,
  SubmissionData,
} from "@/lib/types";
import { isValidSlug, slugify } from "@/lib/utils";
import {
  sanitizeEmail,
  sanitizeMultiline,
  sanitizePhone,
  sanitizeSingleLine,
  sanitizeUrl,
} from "@/lib/sanitize";

type PrismaField = {
  id: string;
  key: string;
  label: string;
  type: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  position: number;
  options: string;
  config: string;
};

type PrismaSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: number;
  fields: PrismaField[];
};

type PrismaForm = {
  id: string;
  slug: string;
  title: string;
  description: string;
  successTitle: string;
  successMessage: string;
  submitLabel: string;
  status: string;
  accent: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  sections: PrismaSection[];
};

function safeJson<T>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function parseOptions(raw: string): FieldOption[] {
  const parsed = safeJson<unknown>(raw, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      value: String(item.value ?? "").trim(),
      label: String(item.label ?? item.value ?? "").trim(),
      swatch: item.swatch ? String(item.swatch) : undefined,
      hint: item.hint ? String(item.hint) : undefined,
    }))
    .filter((item) => item.value.length > 0);
}

export function parseConfig(raw: string): FieldConfig {
  const parsed = safeJson<Record<string, unknown>>(raw, {});
  const config: FieldConfig = {};
  if (typeof parsed.maxSelections === "number") config.maxSelections = parsed.maxSelections;
  if (typeof parsed.minSelections === "number") config.minSelections = parsed.minSelections;
  if (typeof parsed.addLabel === "string") config.addLabel = parsed.addLabel;
  if (typeof parsed.emptyHint === "string") config.emptyHint = parsed.emptyHint;
  if (typeof parsed.maxLength === "number") config.maxLength = parsed.maxLength;
  if (typeof parsed.allowCustom === "boolean") config.allowCustom = parsed.allowCustom;
  if (typeof parsed.autoComplete === "string") config.autoComplete = parsed.autoComplete;
  if (parsed.width === "full" || parsed.width === "half") config.width = parsed.width;
  return config;
}

export function normaliseFieldType(type: string): FieldType {
  const allowed: FieldType[] = [
    "text",
    "email",
    "tel",
    "url",
    "number",
    "textarea",
    "select",
    "color-multi",
    "links",
  ];
  return (allowed as string[]).includes(type) ? (type as FieldType) : "text";
}

export function fieldDTO(field: PrismaField): FormFieldDTO {
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    type: normaliseFieldType(field.type),
    placeholder: field.placeholder,
    helpText: field.helpText,
    required: field.required,
    position: field.position,
    options: parseOptions(field.options),
    config: parseConfig(field.config),
  };
}

export function sectionDTO(section: PrismaSection): FormSectionDTO {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    icon: section.icon,
    position: section.position,
    fields: [...section.fields].sort((a, b) => a.position - b.position).map(fieldDTO),
  };
}

export function formDTO(form: PrismaForm): FormDTO {
  return {
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    successTitle: form.successTitle,
    successMessage: form.successMessage,
    submitLabel: form.submitLabel,
    status: form.status as FormDTO["status"],
    accent: form.accent,
    createdAt: new Date(form.createdAt).toISOString(),
    updatedAt: new Date(form.updatedAt).toISOString(),
    sections: [...form.sections]
      .sort((a, b) => a.position - b.position)
      .map(sectionDTO)
      .filter((section) => section.fields.length > 0),
  };
}

export const formInclude = {
  sections: { include: { fields: true } },
} as const;

/* ----------------------------- normalisation ----------------------------- */

export function normaliseUrl(input: string) {
  return sanitizeUrl(input);
}

const SAFE_LINK = /^https?:\/\/[^\s/]+\.[^\s]{2,}$/i;

const urlSchema = z
  .string()
  .trim()
  .max(2048)
  // Sanitising before validation blocks `javascript:`, `data:` and credential URLs.
  .transform((value) => sanitizeUrl(value))
  .refine((value) => SAFE_LINK.test(value), {
    message: "Enter a valid link, e.g. https://maps.google.com/…",
  });

const emailSchema = z
  .string()
  .trim()
  .max(254)
  .transform((value) => sanitizeEmail(value))
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), {
    message: "Enter a valid email address.",
  });

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => sanitizePhone(value))
  .refine((value) => /^[+()\d][\d\s()\-.]{4,}$/.test(value) && value.replace(/\D/g, "").length >= 6, {
    message: "Enter a valid phone number (digits, spaces, +, - or brackets).",
  });

function textSchema(field: FormFieldDTO) {
  const isLong = field.type === "textarea";
  const max = Math.min(field.config.maxLength ?? (isLong ? 4000 : 500), isLong ? 10_000 : 1000);
  const base = z
    .string()
    .transform((value) => (isLong ? sanitizeMultiline(value, max) : sanitizeSingleLine(value, max)))
    .refine((value) => value.length <= max, { message: `Keep this under ${max} characters.` });
  return field.required ? base.refine((value) => value.length > 0, { message: `${field.label} is required.` }) : base;
}

function colourSchema(field: FormFieldDTO) {
  const allowed = new Set(field.options.map((option) => option.value));
  const max = field.config.maxSelections ?? 5;
  const min = field.config.minSelections ?? (field.required ? 1 : 0);

  return z
    .array(z.string().transform((value) => sanitizeSingleLine(value, 64)))
    .max(20)
    .refine((values) => values.length <= max, {
      message: `Select at most ${max} colours.`,
    })
    .transform((values) => Array.from(new Set(values.filter((value) => allowed.has(value)))))
    .refine((values) => values.length >= min, {
      message:
        min === 0
          ? "Invalid colour selection."
          : `Select at least ${min} ${min === 1 ? "colour" : "colours"}.`,
    })
    .refine((values) => values.length <= max, {
      message: `Select at most ${max} colours.`,
    });
}

function linksSchema(field: FormFieldDTO) {
  const allowedPlatforms = new Set(field.options.map((option) => option.value));

  const row = z.object({
    platform: z.string().transform((value) => sanitizeSingleLine(value, 64)),
    url: z.string().transform((value) => sanitizeUrl(value)),
  });

  return z
    .array(row)
    .max(20, "That is a lot of links — please keep it under 20.")
    .transform((rows) =>
      rows
        .map((item) => ({
          platform: item.platform.trim(),
          url: normaliseUrl(item.url),
        }))
        .filter((item) => item.platform && item.url),
    )
    .superRefine((rows, ctx) => {
      if (field.required && rows.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add at least one link.",
        });
        return;
      }
      rows.forEach((item, index) => {
        if (!allowedPlatforms.has(item.platform) && !field.config.allowCustom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Row ${index + 1}: choose a platform from the list.`,
          });
        }
        if (!SAFE_LINK.test(item.url)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Row ${index + 1}: enter a valid link.`,
          });
        }
      });
    });
}

function schemaForField(field: FormFieldDTO) {
  switch (field.type) {
    case "email":
      return field.required
        ? emailSchema
        : z.union([z.literal(""), emailSchema]).transform((value) => value || "");
    case "tel":
      return field.required
        ? phoneSchema
        : z.union([z.literal(""), phoneSchema]).transform((value) => value || "");
    case "url":
      return field.required
        ? urlSchema
        : z.union([z.literal(""), urlSchema]).transform((value) => value || "");
    case "select": {
      const allowed = field.options.map((option) => option.value);
      const base = z.string().transform((value) => sanitizeSingleLine(value, 200));
      return base.refine(
        (value) => (value === "" && !field.required) || allowed.includes(value),
        { message: "Choose one of the available options." },
      );
    }
    case "number": {
      const base = z
        .union([z.number(), z.string().trim()])
        .transform((value) => (value === "" ? "" : String(value)))
        .refine((value) => value === "" || /^-?\d+(\.\d+)?$/.test(value), {
          message: "Enter a number.",
        });
      return field.required
        ? base.refine((value) => value !== "", { message: `${field.label} is required.` })
        : base;
    }
    case "color-multi":
      return colourSchema(field);
    case "links":
      return linksSchema(field);
    default:
      return textSchema(field);
  }
}

export type ValidationResult =
  | { ok: true; data: SubmissionData }
  | { ok: false; errors: Record<string, string> };

/**
 * Validates a raw submission payload against the dynamic form definition.
 * Unknown keys are dropped, empty optional values are omitted, and every error
 * is mapped back to the field key so the renderer can highlight it inline.
 */
export function validateSubmission(form: FormDTO, payload: unknown): ValidationResult {
  const raw = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const data: SubmissionData = {};

  for (const section of form.sections) {
    for (const field of section.fields) {
      const value = raw[field.key];
      const isBlank =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);

      if (isBlank) {
        if (field.required) {
          errors[field.key] =
            field.type === "color-multi"
              ? `Select at least one colour.`
              : field.type === "links"
                ? "Add at least one link."
                : `${field.label} is required.`;
        }
        continue;
      }

      const result = schemaForField(field).safeParse(value);
      if (!result.success) {
        errors[field.key] = result.error.issues[0]?.message ?? "Invalid value.";
        continue;
      }
      const parsed = result.data as unknown;
      if (parsed === "" || (Array.isArray(parsed) && parsed.length === 0)) continue;
      data[field.key] = parsed as SubmissionData[string];
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data };
}

/* ------------------------------ slug helpers ------------------------------ */

export function validateSlug(raw: string) {
  const slug = slugify(raw);
  if (!isValidSlug(slug)) {
    return { slug, error: "Use lowercase letters, numbers and single dashes (min 2 characters)." };
  }
  return { slug, error: null };
}

export function extractLinks(value: unknown): LinkValue[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is LinkValue =>
      !!item &&
      typeof item === "object" &&
      typeof (item as LinkValue).platform === "string" &&
      typeof (item as LinkValue).url === "string",
  );
}

export function paletteOf(field: FormFieldDTO) {
  return field.options.filter((option) => !!option.swatch);
}

/** Small helper used by the builder to build a fresh, empty field. */
export function emptyFieldDraft(index: number, type: FieldType = "text") {
  return {
    key: `field_${index + 1}`,
    label: "",
    type,
    placeholder: "",
    helpText: "",
    required: false,
    options: [],
    config: {},
  };
}
