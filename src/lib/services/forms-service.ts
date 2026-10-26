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
export async function saveFormDefinition(
  formId: string,
  input: FormDefinitionInput,
  status?: "draft" | "published" | "archived",
) {
  const existing = await getFormRecordById(formId);
  if (!existing) throw new Error("Form not found.");

  const cleanedSections: SectionInput[] = input.sections
    .map((section) => ({
      title: section.title.trim() || "Untitled section",
      description: section.description ?? "",
      icon: section.icon ?? "spark",
      fields: section.fields
        .filter((field) => field.label.trim().length > 0)
        .map((field, fieldIndex) => ({
          key: fieldKey(field.key, field.label, fieldIndex),
          label: field.label.trim(),
          type: field.type,
          placeholder: field.placeholder?.trim() ?? "",
          helpText: field.helpText?.trim() ?? "",
          required: field.required ?? false,
          options: field.options ?? [],
          config: (field.config ?? {}) as Record<string, unknown>,
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

  const requestedSlug = input.slug.trim().toLowerCase();
  if (!isValidSlug(requestedSlug)) {
    throw new Error("Slug must be lowercase letters, numbers and single dashes.");
  }
  const slug =
    requestedSlug === existing.slug ? requestedSlug : await uniqueSlug(requestedSlug, formId);

  return replaceFormDefinition(formId, {
    slug,
    title: input.title.trim() || "Untitled form",
    description: input.description?.trim() ?? "",
    accent: input.accent || "#0072CE",
    submitLabel: input.submitLabel?.trim() || "Submit",
    successTitle: input.successTitle?.trim() || "Submission received",
    successMessage:
      input.successMessage?.trim() ||
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
