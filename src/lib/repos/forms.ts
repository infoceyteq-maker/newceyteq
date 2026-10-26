import { newId, one, query, transaction } from "@/lib/db";
import type { FieldConfig, FieldOption, FieldType } from "@/lib/types";

export type FormRecord = {
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
};

export type FieldRecord = {
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

export type SectionRecord = {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: number;
  fields: FieldRecord[];
};

export type FormWithSections = FormRecord & { sections: SectionRecord[] };

const FORM_COLUMNS = `id, slug, title, description,
  success_title as "successTitle", success_message as "successMessage",
  submit_label as "submitLabel", status, accent,
  created_at as "createdAt", updated_at as "updatedAt"`;

const FIELD_COLUMNS = `id, key, label, type, placeholder, help_text as "helpText",
  required, position, options, config`;

async function hydrateForms(rows: FormRecord[]): Promise<FormWithSections[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const idList = ids.map((_, index) => `$${index + 1}`).join(", ");

  const sections = await query<{
    id: string;
    formId: string;
    title: string;
    description: string;
    icon: string;
    position: number;
  }>(
    `select id, form_id as "formId", title, description, icon, position
       from form_sections
      where form_id in (${idList})
      order by position asc`,
    ids,
  );

  const sectionIds = sections.map((section) => section.id);
  let fields: Array<FieldRecord & { sectionId: string }> = [];
  if (sectionIds.length > 0) {
    const sectionList = sectionIds.map((_, index) => `$${index + 1}`).join(", ");
    fields = await query<FieldRecord & { sectionId: string }>(
      `select ${FIELD_COLUMNS}, section_id as "sectionId"
         from form_fields
        where section_id in (${sectionList})
        order by position asc`,
      sectionIds,
    );
  }

  return rows.map((row) => ({
    ...row,
    sections: sections
      .filter((section) => section.formId === row.id)
      .map<SectionRecord>((section) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        icon: section.icon,
        position: section.position,
        fields: fields.filter((field) => field.sectionId === section.id),
      })),
  }));
}

export async function getFormBySlug(slug: string): Promise<FormWithSections | null> {
  const rows = await query<FormRecord>(`select ${FORM_COLUMNS} from forms where slug = $1 limit 1`, [slug]);
  const [form] = await hydrateForms(rows);
  return form ?? null;
}

export async function getFormById(id: string): Promise<FormWithSections | null> {
  const rows = await query<FormRecord>(`select ${FORM_COLUMNS} from forms where id = $1 limit 1`, [id]);
  const [form] = await hydrateForms(rows);
  return form ?? null;
}

export type FormListItem = FormRecord & {
  sectionCount: number;
  fieldCount: number;
  submissionCount: number;
};

export async function listForms(): Promise<FormListItem[]> {
  return query<FormListItem>(
    `select f.id, f.slug, f.title, f.description,
            f.success_title as "successTitle", f.success_message as "successMessage",
            f.submit_label as "submitLabel", f.status, f.accent,
            f.created_at as "createdAt", f.updated_at as "updatedAt",
            (select count(*)::int from form_sections s where s.form_id = f.id) as "sectionCount",
            (select count(*)::int
               from form_fields fl
               join form_sections s2 on s2.id = fl.section_id
              where s2.form_id = f.id) as "fieldCount",
            (select count(*)::int from submissions sub where sub.form_id = f.id) as "submissionCount"
       from forms f
      order by f.updated_at desc`,
  );
}

export async function countForms(options: { status?: string } = {}) {
  const row = options.status
    ? await one<{ count: string }>("select count(*)::int as count from forms where status = $1", [
        options.status,
      ])
    : await one<{ count: string }>("select count(*)::int as count from forms");
  return Number(row?.count ?? 0);
}

export async function slugExists(slug: string, ignoreId?: string) {
  const row = ignoreId
    ? await one<{ id: string }>("select id from forms where slug = $1 and id <> $2", [slug, ignoreId])
    : await one<{ id: string }>("select id from forms where slug = $1", [slug]);
  return !!row;
}

export type FieldInput = {
  key: string;
  label: string;
  type: FieldType | string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: FieldOption[];
  config?: FieldConfig;
};

export type SectionInput = {
  title: string;
  description?: string;
  icon?: string;
  fields: FieldInput[];
};

export type FormCreateInput = {
  slug: string;
  title: string;
  description?: string;
  status?: string;
  accent?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  createdById?: string | null;
  sections: SectionInput[];
};

/** Creates a form together with its nested sections and fields. */
export async function createForm(input: FormCreateInput): Promise<FormWithSections> {
  const formId = newId("frm");

  await transaction(async (tx) => {
    await tx.query(
      `insert into forms
        (id, slug, title, description, success_title, success_message, submit_label, status, accent, created_by_id)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        formId,
        input.slug,
        input.title,
        input.description ?? "",
        input.successTitle ?? "Submission received",
        input.successMessage ??
          "Thank you. Our team will review your details and get back to you shortly.",
        input.submitLabel ?? "Submit",
        input.status ?? "draft",
        input.accent ?? "#2F6BFF",
        input.createdById ?? null,
      ],
    );

    for (const [sectionIndex, section] of input.sections.entries()) {
      const sectionId = newId("sec");
      await tx.query(
        `insert into form_sections (id, form_id, title, description, icon, position)
         values ($1, $2, $3, $4, $5, $6)`,
        [sectionId, formId, section.title, section.description ?? "", section.icon ?? "spark", sectionIndex],
      );

      for (const [fieldIndex, field] of section.fields.entries()) {
        await tx.query(
          `insert into form_fields
            (id, section_id, key, label, type, placeholder, help_text, required, position, options, config)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            newId("fld"),
            sectionId,
            field.key,
            field.label,
            field.type,
            field.placeholder ?? "",
            field.helpText ?? "",
            field.required ?? false,
            fieldIndex,
            JSON.stringify(field.options ?? []),
            JSON.stringify(field.config ?? {}),
          ],
        );
      }
    }
  });

  const form = await getFormById(formId);
  if (!form) throw new Error("Form could not be created.");
  return form;
}

export type FormUpdateInput = {
  slug: string;
  title: string;
  description?: string;
  status?: string;
  accent?: string;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  sections: SectionInput[];
};

/**
 * Replaces the whole definition of a form. Sections and fields are rebuilt in a
 * single transaction so concurrent visitors never see a half-saved schema.
 */
export async function replaceFormDefinition(formId: string, input: FormUpdateInput) {
  await transaction(async (tx) => {
    await tx.query(
      `update forms
          set slug = $2, title = $3, description = $4, success_title = $5,
              success_message = $6, submit_label = $7, accent = $8,
              status = coalesce($9, status), updated_at = now()
        where id = $1`,
      [
        formId,
        input.slug,
        input.title,
        input.description ?? "",
        input.successTitle ?? "Submission received",
        input.successMessage ??
          "Thank you. Our team will review your details and get back to you shortly.",
        input.submitLabel ?? "Submit",
        input.accent ?? "#2F6BFF",
        input.status ?? null,
      ],
    );

    await tx.query("delete from form_sections where form_id = $1", [formId]);

    for (const [sectionIndex, section] of input.sections.entries()) {
      const sectionId = newId("sec");
      await tx.query(
        `insert into form_sections (id, form_id, title, description, icon, position)
         values ($1, $2, $3, $4, $5, $6)`,
        [sectionId, formId, section.title, section.description ?? "", section.icon ?? "spark", sectionIndex],
      );

      for (const [fieldIndex, field] of section.fields.entries()) {
        await tx.query(
          `insert into form_fields
            (id, section_id, key, label, type, placeholder, help_text, required, position, options, config)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            newId("fld"),
            sectionId,
            field.key,
            field.label,
            field.type,
            field.placeholder ?? "",
            field.helpText ?? "",
            field.required ?? false,
            fieldIndex,
            JSON.stringify(field.options ?? []),
            JSON.stringify(field.config ?? {}),
          ],
        );
      }
    }
  });

  const form = await getFormById(formId);
  if (!form) throw new Error("Form not found.");
  return form;
}

export async function updateFormStatus(id: string, status: string) {
  return one<{ id: string; status: string; slug: string }>(
    "update forms set status = $2, updated_at = now() where id = $1 returning id, status, slug",
    [id, status],
  );
}

export async function deleteForm(id: string) {
  await query("delete from forms where id = $1", [id]);
}
