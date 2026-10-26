import "server-only";

import {
  countForms,
  createForm,
  deleteForm,
  getFormById as getFormRecordById,
  getFormBySlug as getFormRecordBySlug,
  listForms as listFormRecords,
  replaceFormDefinition,
  slugExists,
  updateFormStatus,
  type FormWithSections,
  type SectionInput,
} from "@/lib/repos/forms";
import { formDTO } from "@/lib/forms";
import type { FieldOption, FieldType, FormDTO } from "@/lib/types";
import type { FormTemplate } from "@/lib/templates";
import { isValidSlug, slugify } from "@/lib/utils";
import { sanitizeIdentifier, sanitizeMultiline, sanitizeSingleLine } from "@/lib/sanitize";

export type FormDefinitionInput = {
  title: string;
  description?: string;
  slug: string;
  status?: "draft" | "published" | "archived";
  accent?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  sections: Array<{
    title: string;
    description?: string;
    icon?: string;
    fields: Array<{
      key?: string;
      label: string;
      type: FieldType;
      placeholder?: string;
      helpText?: string;
      required?: boolean;
      options?: FieldOption[];
      config?: Record<string, unknown>;
    }>;
  }>;
};

function fieldKey(raw: string | undefined, label: string, index: number) {
  const source = (raw || label || "").trim();
  const key = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return key || `field_${index + 1}`;
}

/** Guarantees a unique slug, appending -2, -3, … when the base is taken. */
export async function uniqueSlug(base: string, ignoreId?: string) {
  const root = slugify(base);
  let candidate = root;
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!(await slugExists(candidate, ignoreId))) return candidate;
    counter += 1;
    candidate = `${root}-${counter}`.slice(0, 64);
  }
}

export async function listForms() {
  const forms = await listFormRecords();
  return forms.map((form) => ({
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    status: form.status,
    accent: form.accent,
    updatedAt: new Date(form.updatedAt).toISOString(),
    createdAt: new Date(form.createdAt).toISOString(),
    sectionCount: Number(form.sectionCount),
    fieldCount: Number(form.fieldCount),
    submissionCount: Number(form.submissionCount),
  }));
}

export async function getFormBySlug(slug: string) {
  return getFormRecordBySlug(slug);
}

export async function getFormById(id: string) {
  return getFormRecordById(id);
}

export async function getPublishedFormBySlug(slug: string) {
  const form = await getFormRecordBySlug(slug);
  if (!form || form.status !== "published") return null;
  return form;
}

function sectionInputsFromTemplate(template: FormTemplate): SectionInput[] {
  return template.sections.map((section) => ({
    title: section.title,
    description: section.description ?? "",
    icon: section.icon ?? "spark",
    fields: section.fields.map((field, fieldIndex) => ({
      key: fieldKey(field.key, field.label, fieldIndex),
      label: field.label,
      type: field.type,
      placeholder: field.placeholder ?? "",
      helpText: field.helpText ?? "",
      required: field.required ?? false,
      options: field.options ?? [],
      config: field.config ?? {},
    })),
  }));
}

export async function createFormFromTemplate(template: FormTemplate, ownerId?: string) {
  const slug = await uniqueSlug(template.slug);
  return createForm({
    slug,
    title: template.title,
    description: template.description,
    status: template.status,
    submitLabel: template.submitLabel,
    successTitle: template.successTitle,
    successMessage: template.successMessage,
    createdById: ownerId ?? null,
    sections: sectionInputsFromTemplate(template),
  });
}

export async function createBlankForm(ownerId?: string) {
  const slug = await uniqueSlug("untitled-form");
  return createForm({
    slug,
    title: "Untitled form",
    description: "",
    status: "draft",
    createdById: ownerId ?? null,
    sections: [
      {
        title: "Section 1",
        description: "",
        icon: "spark",
        fields: [
          {
            key: "full_name",
            label: "Full Name",
            type: "text",
            placeholder: "Your name",
            required: true,
            config: { width: "half" },
          },
          {
            key: "email",
            label: "Email Address",
            type: "email",
            placeholder: "you@example.com",
            required: true,
            config: { width: "half" },
          },
        ],
      },
    ],
  });
}

/**
 * Full replace of a form definition inside one transaction so the builder can
 * reorder / rename / delete freely while the public form stays consistent.
 */
const FIELD_TYPES = new Set([
  "text",
  "textarea",
  "email",
  "tel",
  "url",
  "number",
  "select",
  "radio",
  "checkbox",
  "color",
  "color-multi",
  "links",
  "date",
]);

/** Only known config keys survive, each with a bounded JSON-safe value. */
function sanitizeFieldConfig(config: unknown): Record<string, unknown> {
  if (!config || typeof config !== "object" || Array.isArray(config)) return {};
  const source = config as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  if (source.width === "half" || source.width === "full") out.width = source.width;
  for (const key of ["autoComplete", "pattern", "addLabel", "emptyHint"]) {
    const value = source[key];
    if (typeof value === "string") out[key] = sanitizeSingleLine(value, 120);
  }
  for (const key of ["min", "max", "maxLength", "minLength", "minSelections", "maxSelections", "rows"]) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
  }
  return out;
}

export async function saveFormDefinition(
  formId: string,
  input: FormDefinitionInput,
  status?: "draft" | "published" | "archived",
) {
  const existing = await getFormRecordById(formId);
  if (!existing) throw new Error("Form not found.");

  const cleanedSections: SectionInput[] = input.sections
    .map((section) => ({
      title: sanitizeSingleLine(section.title, 160) || "Untitled section",
      description: sanitizeMultiline(section.description, 600),
      icon: sanitizeIdentifier(section.icon, 32) || "spark",
      fields: (Array.isArray(section.fields) ? section.fields : [])
        .filter(
          (field) =>
            field &&
            typeof field.label === "string" &&
            sanitizeSingleLine(field.label, 200).length > 0 &&
            FIELD_TYPES.has(field.type),
        )
        .slice(0, 60)
        .map((field, fieldIndex) => ({
          key: fieldKey(field.key, field.label, fieldIndex),
          label: sanitizeSingleLine(field.label, 200),
          type: field.type,
          placeholder: sanitizeSingleLine(field.placeholder, 240),
          helpText: sanitizeMultiline(field.helpText, 400),
          required: field.required === true,
          options: (Array.isArray(field.options) ? field.options : [])
            .slice(0, 40)
            .map((option) => ({
              value: sanitizeIdentifier(option?.value, 60),
              label: sanitizeSingleLine(option?.label, 120),
              // Swatches must stay valid CSS hex values (used by color-multi).
              swatch: /^#[0-9a-f]{3,8}$/i.test(option?.swatch ?? "") ? option.swatch : undefined,
              hint: option?.hint ? sanitizeIdentifier(option.hint, 40) : undefined,
            }))
            .filter((option) => option.value && option.label),
          config: sanitizeFieldConfig(field.config),
        })),
    }))
    .filter((section) => section.fields.length > 0);

  if (cleanedSections.length === 0) {
    throw new Error("A form needs at least one section with one field.");
  }

  // De-duplicate field keys across the whole form (they become submission columns).
  const used = new Set<string>();
  for (const section of cleanedSections) {
    for (const [index, field] of section.fields.entries()) {
      let key = field.key ?? `field_${index + 1}`;
      while (used.has(key)) key = `${key}_${index + 1}`;
      used.add(key);
      field.key = key;
    }
  }

  const requestedSlug = sanitizeIdentifier(input.slug, 80).toLowerCase();
  if (!isValidSlug(requestedSlug)) {
    throw new Error("Slug must be lowercase letters, numbers and single dashes.");
  }
  const slug =
    requestedSlug === existing.slug ? requestedSlug : await uniqueSlug(requestedSlug, formId);

  return replaceFormDefinition(formId, {
    slug,
    title: sanitizeSingleLine(input.title, 140) || "Untitled form",
    description: sanitizeMultiline(input.description, 600),
    accent: /^#[0-9a-f]{6}$/i.test(input.accent ?? "") ? input.accent : "#0072CE",
    submitLabel: sanitizeSingleLine(input.submitLabel, 60) || "Submit",
    successTitle: sanitizeSingleLine(input.successTitle, 120) || "Submission received",
    successMessage:
      sanitizeMultiline(input.successMessage, 600) ||
      "Thank you. Our team will review your details and get back to you shortly.",
    status: status ?? input.status,
    sections: cleanedSections,
  });
}

export async function setFormStatus(id: string, status: "draft" | "published" | "archived") {
  return updateFormStatus(id, status);
}

export async function duplicateForm(id: string, ownerId?: string) {
  const source = await getFormRecordById(id);
  if (!source) throw new Error("Form not found.");
  const slug = await uniqueSlug(`${source.slug}-copy`);
  return createForm({
    slug,
    title: `${source.title} (copy)`,
    description: source.description,
    status: "draft",
    accent: source.accent,
    submitLabel: source.submitLabel,
    successTitle: source.successTitle,
    successMessage: source.successMessage,
    createdById: ownerId ?? null,
    sections: [...source.sections]
      .sort((a, b) => a.position - b.position)
      .map((section) => ({
        title: section.title,
        description: section.description,
        icon: section.icon,
        fields: [...section.fields]
          .sort((a, b) => a.position - b.position)
          .map((field) => ({
            key: field.key,
            label: field.label,
            type: field.type as FieldType,
            placeholder: field.placeholder,
            helpText: field.helpText,
            required: field.required,
            options: JSON.parse(field.options || "[]") as FieldOption[],
            config: JSON.parse(field.config || "{}") as Record<string, unknown>,
          })),
      })),
  });
}

export async function removeForm(id: string) {
  await deleteForm(id);
}

export { removeForm as deleteForm };

export { countForms };

export function toPlainForm(form: FormWithSections): FormDTO {
  return formDTO({
    ...form,
    createdAt: new Date(form.createdAt),
    updatedAt: new Date(form.updatedAt),
  });
}
