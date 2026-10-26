"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { NeuSelect } from "@/components/ui/NeuSelect";
import { CopyButton } from "@/components/ui/CopyButton";
import { FIELD_TYPE_META, DEFAULT_PALETTE, DEFAULT_PLATFORMS, SECTION_ICONS } from "@/lib/types";
import type { FieldConfig, FieldOption, FieldType, FormDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type DraftField = {
  uid: string;
  key: string;
  label: string;
  type: FieldType;
  placeholder: string;
  helpText: string;
  required: boolean;
  options: FieldOption[];
  config: FieldConfig;
};

type DraftSection = {
  uid: string;
  title: string;
  description: string;
  icon: string;
  fields: DraftField[];
};

type Draft = {
  title: string;
  slug: string;
  description: string;
  status: "draft" | "published" | "archived";
  accent: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  sections: DraftSection[];
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

function toDraft(form: FormDTO): Draft {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    status: form.status,
    accent: form.accent,
    submitLabel: form.submitLabel,
    successTitle: form.successTitle,
    successMessage: form.successMessage,
    sections: form.sections.map((section) => ({
      uid: uid(),
      title: section.title,
      description: section.description,
      icon: section.icon,
      fields: section.fields.map((field) => ({
        uid: uid(),
        key: field.key,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        helpText: field.helpText,
        required: field.required,
        options: field.options,
        config: field.config,
      })),
    })),
  };
}

function slugifyKey(label: string, index: number) {
  const key = label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
  return key || `field_${index + 1}`;
}

function defaultOptionsFor(type: FieldType): FieldOption[] {
  if (type === "color-multi") return DEFAULT_PALETTE;
  if (type === "links") return DEFAULT_PLATFORMS;
  if (type === "select")
    return [
      { value: "option-1", label: "Option 1" },
      { value: "option-2", label: "Option 2" },
    ];
  return [];
}

const SECTION_ICON_OPTIONS = SECTION_ICONS.map((icon) => ({ value: icon, label: icon }));

export function FormBuilder({ form }: { form: FormDTO }) {
  const router = useRouter();
  const initialSnapshot = useMemo(() => JSON.stringify(toDraft(form).sections) + form.title + form.slug, [form]);
  const [draft, setDraft] = useState<Draft>(() => toDraft(form));
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(draft.sections.map((section, index) => [section.uid, index === 0])),
  );
  const [openFields, setOpenFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const savedRef = useRef<string>(initialSnapshot);

  const currentSnapshot = JSON.stringify(draft.sections) + draft.title + draft.slug;
  const dirty = currentSnapshot !== savedRef.current;

  const patch = useCallback((updater: (prev: Draft) => Draft) => {
    setDraft((prev) => updater(prev));
    setMessage(null);
  }, []);

  const patchSection = (sectionUid: string, changes: Partial<DraftSection>) =>
    patch((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.uid === sectionUid ? { ...section, ...changes } : section,
      ),
    }));

  const patchField = (sectionUid: string, fieldUid: string, changes: Partial<DraftField>) =>
    patch((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.uid === sectionUid
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.uid === fieldUid ? { ...field, ...changes } : field,
              ),
            }
          : section,
      ),
    }));

  const addSection = () =>
    patch((prev) => {
      const section: DraftSection = {
        uid: uid(),
        title: `Section ${prev.sections.length + 1}`,
        description: "",
        icon: "spark",
        fields: [],
      };
      setOpenSections((open) => ({ ...open, [section.uid]: true }));
      return { ...prev, sections: [...prev.sections, section] };
    });

  const removeSection = (sectionUid: string) => {
    if (!window.confirm("Remove this section and all of its fields?")) return;
    patch((prev) => ({ ...prev, sections: prev.sections.filter((section) => section.uid !== sectionUid) }));
  };

  const moveSection = (index: number, direction: -1 | 1) =>
    patch((prev) => {
      const next = [...prev.sections];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, sections: next };
    });

  const addField = (sectionUid: string) =>
    patch((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.uid !== sectionUid) return section;
        const index = section.fields.length;
        const field: DraftField = {
          uid: uid(),
          key: `field_${index + 1}`,
          label: "",
          type: "text",
          placeholder: "",
          helpText: "",
          required: false,
          options: [],
          config: { width: "full" },
        };
        setOpenFields((open) => ({ ...open, [field.uid]: true }));
        return { ...section, fields: [...section.fields, field] };
      }),
    }));

  const removeField = (sectionUid: string, fieldUid: string) =>
    patch((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.uid === sectionUid
          ? { ...section, fields: section.fields.filter((field) => field.uid !== fieldUid) }
          : section,
      ),
    }));

  const moveField = (sectionUid: string, index: number, direction: -1 | 1) =>
    patch((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.uid !== sectionUid) return section;
        const next = [...section.fields];
        const target = index + direction;
        if (target < 0 || target >= next.length) return section;
        [next[index], next[target]] = [next[target], next[index]];
        return { ...section, fields: next };
      }),
    }));

  const duplicateField = (sectionUid: string, fieldUid: string) =>
    patch((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => {
        if (section.uid !== sectionUid) return section;
        const index = section.fields.findIndex((field) => field.uid === fieldUid);
        if (index === -1) return section;
        const copy: DraftField = {
          ...section.fields[index],
          uid: uid(),
          key: `${section.fields[index].key}_copy`,
          label: `${section.fields[index].label} (copy)`,
        };
        const next = [...section.fields];
        next.splice(index + 1, 0, copy);
        return { ...section, fields: next };
      }),
    }));

  const save = async (status?: Draft["status"]) => {
    setSaving(true);
    setMessage(null);

    const labelsWithoutKeys = draft.sections.some((section) =>
      section.fields.some((field) => !field.label.trim()),
    );
    if (labelsWithoutKeys) {
      setMessage({ type: "error", text: "Every field needs a label before saving." });
      setSaving(false);
      return;
    }

    const definition = {
      title: draft.title,
      description: draft.description,
      slug: draft.slug,
      status: status ?? draft.status,
      accent: draft.accent,
      submitLabel: draft.submitLabel,
      successTitle: draft.successTitle,
      successMessage: draft.successMessage,
      sections: draft.sections.map((section) => ({
        title: section.title,
        description: section.description,
        icon: section.icon,
        fields: section.fields.map((field, index) => ({
          key: field.key || slugifyKey(field.label, index),
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          helpText: field.helpText,
          required: field.required,
          options: field.options,
          config: field.config,
        })),
      })),
    };

    try {
      const response = await fetch(`/api/admin/forms/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition, status: status ?? draft.status }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        slug?: string;
        status?: string;
      };
      if (!response.ok) {
        setMessage({ type: "error", text: payload.error ?? "Unable to save this form." });
        setSaving(false);
        return;
      }
      savedRef.current = currentSnapshot;
      setDraft((prev) => ({
        ...prev,
        slug: payload.slug ?? prev.slug,
        status: (payload.status as Draft["status"]) ?? status ?? prev.status,
      }));
      setLastSaved(new Date().toLocaleTimeString());
      setMessage({ type: "ok", text: "Saved. The public form is up to date." });
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Network error — your changes are still here, try again." });
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `/form/${draft.slug}`;
  const totalFields = draft.sections.reduce((total, section) => total + section.fields.length, 0);

  return (
    <div className="space-y-5">
      {/* Sticky action bar */}
      <div className="neu-raised sticky top-3 z-30 rounded-neu-lg px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/admin/forms" aria-label="Back to forms" className="neu-btn h-10 w-10 shrink-0 !px-0">
              <Icon.arrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-bold text-navy-700">{draft.title || "Untitled form"}</p>
                <span
                  className={cn(
                    "neu-badge shrink-0",
                    draft.status === "published"
                      ? "bg-emerald-100/80 text-emerald-700"
                      : draft.status === "draft"
                        ? "bg-amber-100/80 text-amber-700"
                        : "bg-ash-100 text-navy-400 shadow-neu-inset-sm",
                  )}
                >
                  {draft.status}
                </span>
              </div>
              <p className="truncate text-[11.5px] font-semibold text-navy-300">
                {dirty ? "Unsaved changes" : lastSaved ? `Saved ${lastSaved}` : "All changes saved"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={publicUrl} target="_blank" className="neu-btn !px-3.5 !py-2 !text-[12px]">
              <Icon.eye size={14} />
              Preview
            </Link>
            <CopyButton value={publicUrl} label="Copy link" compact />
            <button
              type="button"
              onClick={() => save()}
              disabled={saving}
              className="neu-btn !px-4 !py-2 !text-[12px]"
            >
              {saving ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300/40 border-t-navy-500" />
              ) : (
                <Icon.check size={14} />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={() => save(draft.status === "published" ? "draft" : "published")}
              disabled={saving}
              className={cn("neu-btn !px-4 !py-2 !text-[12px]", draft.status !== "published" && "neu-btn-primary")}
            >
              <Icon.bolt size={14} />
              {draft.status === "published" ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {message ? (
          <div
            role="status"
            className={cn(
              "mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold",
              message.type === "ok" ? "bg-emerald-100/70 text-emerald-700" : "bg-rose-100/70 text-rose-700",
            )}
          >
            <Icon.alert size={13} />
            {message.text}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <div className="min-w-0 space-y-4">
          {/* Form settings */}
          <section className="neu rounded-neu-lg p-4 sm:p-5">
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="neu-orb h-10 w-10 text-ceyteq-500">
                  <Icon.settings size={16} />
                </span>
                <span>
                  <span className="block text-[14px] font-bold text-navy-700">Form settings</span>
                  <span className="block text-[11.5px] font-medium text-navy-300">
                    Title, slug, submit label and success message
                  </span>
                </span>
              </span>
              <Icon.chevron
                size={16}
                className={cn("shrink-0 text-navy-300 transition-transform", showSettings && "rotate-180")}
              />
            </button>

            {showSettings ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="form-title" className="label">
                    Form title
                  </label>
                  <input
                    id="form-title"
                    className="neu-input"
                    value={draft.title}
                    onChange={(event) => patch((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="form-slug" className="label">
                    Public slug
                  </label>
                  <div className="neu-input flex items-center gap-1 !px-3 !py-0">
                    <span className="text-[12px] font-semibold text-navy-300">/form/</span>
                    <input
                      id="form-slug"
                      className="w-full bg-transparent py-3.5 text-[14px] font-semibold text-navy-600 outline-none"
                      value={draft.slug}
                      onChange={(event) =>
                        patch((prev) => ({
                          ...prev,
                          slug: event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, "-")
                            .replace(/^-+|-+$/g, ""),
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="form-accent" className="label">
                    Accent colour
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="form-accent"
                      type="color"
                      value={draft.accent}
                      onChange={(event) => patch((prev) => ({ ...prev, accent: event.target.value }))}
                      className="h-12 w-14 cursor-pointer rounded-xl bg-transparent p-1 shadow-neu-inset-sm"
                    />
                    <input
                      aria-label="Accent hex"
                      className="neu-input"
                      value={draft.accent}
                      onChange={(event) => patch((prev) => ({ ...prev, accent: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="form-description" className="label">
                    Description
                  </label>
                  <textarea
                    id="form-description"
                    rows={2}
                    className="neu-input resize-y"
                    value={draft.description}
                    onChange={(event) => patch((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="form-submit" className="label">
                    Submit button label
                  </label>
                  <input
                    id="form-submit"
                    className="neu-input"
                    value={draft.submitLabel}
                    onChange={(event) => patch((prev) => ({ ...prev, submitLabel: event.target.value }))}
                  />
                </div>
                <div>
                  <label htmlFor="form-success-title" className="label">
                    Success title
                  </label>
                  <input
                    id="form-success-title"
                    className="neu-input"
                    value={draft.successTitle}
                    onChange={(event) => patch((prev) => ({ ...prev, successTitle: event.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="form-success-message" className="label">
                    Success message
                  </label>
                  <textarea
                    id="form-success-message"
                    rows={2}
                    className="neu-input resize-y"
                    value={draft.successMessage}
                    onChange={(event) => patch((prev) => ({ ...prev, successMessage: event.target.value }))}
                  />
                </div>
              </div>
            ) : null}
          </section>

          {/* Sections */}
          {draft.sections.map((section, sectionIndex) => {
            const open = openSections[section.uid] ?? false;
            return (
              <section key={section.uid} className="neu-raised rounded-neu-lg p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenSections((prev) => ({ ...prev, [section.uid]: !open }))
                    }
                    className="neu-orb h-11 w-11 shrink-0 text-ceyteq-500"
                    aria-label={open ? "Collapse section" : "Expand section"}
                  >
                    <Icon.chevron size={16} className={cn("transition-transform", open && "rotate-180")} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="neu-badge bg-ash-100 text-navy-300">
                        {String(sectionIndex + 1).padStart(2, "0")}
                      </span>
                      {open ? (
                        <input
                          aria-label="Section title"
                          className="neu-input !w-auto min-w-[180px] flex-1 !py-2 !text-[14px] font-bold"
                          value={section.title}
                          onChange={(event) => patchSection(section.uid, { title: event.target.value })}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenSections((prev) => ({ ...prev, [section.uid]: true }))}
                          className="text-[15px] font-bold text-navy-700 hover:text-ceyteq-600"
                        >
                          {section.title}
                        </button>
                      )}
                      <span className="text-[11px] font-semibold text-navy-300">
                        {section.fields.length} fields
                      </span>
                    </div>

                    {!open ? (
                      <p className="mt-1.5 line-clamp-1 text-[12px] text-navy-300">
                        {section.description || "No description"}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(sectionIndex, -1)}
                      disabled={sectionIndex === 0}
                      aria-label="Move section up"
                      className="neu-btn h-8 w-8 !px-0 disabled:opacity-40"
                    >
                      <Icon.chevron size={14} className="rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(sectionIndex, 1)}
                      disabled={sectionIndex === draft.sections.length - 1}
                      aria-label="Move section down"
                      className="neu-btn h-8 w-8 !px-0 disabled:opacity-40"
                    >
                      <Icon.chevron size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(section.uid)}
                      aria-label="Delete section"
                      className="neu-btn h-8 w-8 !px-0 text-navy-300 hover:!text-rose-500"
                    >
                      <Icon.trash size={14} />
                    </button>
                  </div>
                </div>

                {open ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                      <input
                        aria-label="Section description"
                        placeholder="Section description (optional)"
                        className="neu-input !py-2.5 !text-[13px]"
                        value={section.description}
                        onChange={(event) => patchSection(section.uid, { description: event.target.value })}
                      />
                      <NeuSelect
                        options={SECTION_ICON_OPTIONS}
                        value={section.icon}
                        onChange={(icon) => patchSection(section.uid, { icon })}
                        ariaLabel="Section icon"
                        size="sm"
                      />
                    </div>

                    <div className="space-y-2">
                      {section.fields.map((field, fieldIndex) => {
                        const fieldOpen = openFields[field.uid] ?? false;
                        return (
                          <div key={field.uid} className="neu rounded-2xl p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenFields((prev) => ({ ...prev, [field.uid]: !fieldOpen }))
                                }
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-navy-300 transition-colors hover:text-ceyteq-500"
                                aria-label={fieldOpen ? "Collapse field" : "Edit field"}
                              >
                                <Icon.chevron
                                  size={14}
                                  className={cn("transition-transform", fieldOpen && "rotate-180")}
                                />
                              </button>

                              {fieldOpen ? (
                                <input
                                  aria-label="Field label"
                                  className="neu-input min-w-[160px] flex-1 !py-2 !text-[13.5px] font-semibold"
                                  value={field.label}
                                  placeholder="Field label"
                                  onChange={(event) =>
                                    patchField(section.uid, field.uid, {
                                      label: event.target.value,
                                      key: field.key.startsWith("field_")
                                        ? slugifyKey(event.target.value, fieldIndex)
                                        : field.key,
                                    })
                                  }
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenFields((prev) => ({ ...prev, [field.uid]: true }))
                                  }
                                  className="min-w-0 flex-1 truncate text-left text-[13.5px] font-semibold text-navy-600"
                                >
                                  {field.label || "Untitled field"}
                                </button>
                              )}

                              <span className="neu-badge shrink-0 bg-ash-100 text-navy-400">
                                {FIELD_TYPE_META[field.type]?.label ?? field.type}
                              </span>

                              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-navy-300">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(event) =>
                                    patchField(section.uid, field.uid, { required: event.target.checked })
                                  }
                                  className="h-3.5 w-3.5 accent-[#2F6BFF]"
                                />
                                Req
                              </label>

                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveField(section.uid, fieldIndex, -1)}
                                  disabled={fieldIndex === 0}
                                  aria-label="Move field up"
                                  className="neu-btn h-7 w-7 !px-0 disabled:opacity-30"
                                >
                                  <Icon.chevron size={12} className="rotate-180" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveField(section.uid, fieldIndex, 1)}
                                  disabled={fieldIndex === section.fields.length - 1}
                                  aria-label="Move field down"
                                  className="neu-btn h-7 w-7 !px-0 disabled:opacity-30"
                                >
                                  <Icon.chevron size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => duplicateField(section.uid, field.uid)}
                                  aria-label="Duplicate field"
                                  className="neu-btn h-7 w-7 !px-0"
                                >
                                  <Icon.copy size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeField(section.uid, field.uid)}
                                  aria-label="Delete field"
                                  className="neu-btn h-7 w-7 !px-0 text-navy-300 hover:!text-rose-500"
                                >
                                  <Icon.trash size={12} />
                                </button>
                              </div>
                            </div>

                            {fieldOpen ? (
                              <FieldEditor
                                field={field}
                                index={fieldIndex}
                                onChange={(changes) => patchField(section.uid, field.uid, changes)}
                              />
                            ) : null}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => addField(section.uid)}
                        className="neu-btn w-full !py-2.5 !text-[12.5px]"
                      >
                        <Icon.plus size={14} className="text-ceyteq-500" />
                        Add field
                      </button>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}

          <button type="button" onClick={addSection} className="neu-btn w-full !py-3.5">
            <Icon.plus size={16} className="text-ceyteq-500" />
            Add another section
          </button>
        </div>

        {/* Right rail */}
        <aside className="space-y-4 xl:sticky xl:top-[104px]">
          <div className="neu rounded-neu-lg p-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">Public link</p>
            <div className="neu-sunken mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2.5">
              <Icon.link size={13} className="shrink-0 text-navy-300" />
              <span className="flex-1 truncate text-[11.5px] font-semibold text-navy-500">/form/{draft.slug}</span>
            </div>
            <div className="mt-2.5 flex gap-2">
              <CopyButton value={publicUrl} label="Copy" compact className="flex-1" />
              <Link href={publicUrl} target="_blank" className="neu-btn flex-1 !py-1.5 !text-[11.5px]">
                <Icon.external size={12} />
                Open
              </Link>
            </div>
            {draft.status !== "published" ? (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-100/70 px-2.5 py-2 text-[11px] font-semibold text-amber-700">
                <Icon.alert size={12} className="mt-0.5 shrink-0" />
                Draft forms only open for signed-in admins.
              </p>
            ) : null}
          </div>

          <div className="neu rounded-neu-lg p-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">Structure</p>
            <dl className="mt-3 space-y-2 text-[12px] font-semibold">
              {[
                { label: "Sections", value: draft.sections.length },
                { label: "Fields", value: totalFields },
                {
                  label: "Required",
                  value: draft.sections.reduce(
                    (total, section) => total + section.fields.filter((field) => field.required).length,
                    0,
                  ),
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <dt className="text-navy-300">{item.label}</dt>
                  <dd className="font-display text-[14px] font-semibold text-navy-600">{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className="neu-divider my-4" />
            <div className="space-y-1.5">
              {draft.sections.map((section, index) => (
                <button
                  key={section.uid}
                  type="button"
                  onClick={() =>
                    setOpenSections((prev) => ({ ...prev, [section.uid]: true }))
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] font-semibold text-navy-400 transition-colors hover:bg-ash-100"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-ash-100 text-[10px] text-navy-400">
                    {index + 1}
                  </span>
                  <span className="truncate">{section.title || "Untitled"}</span>
                  <span className="ml-auto text-[10px] text-navy-300">{section.fields.length}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="neu rounded-neu-lg p-5">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-navy-300">Tips</p>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-navy-400">
              <li className="flex gap-2">
                <Icon.check size={13} className="mt-0.5 shrink-0 text-ceyteq-500" />
                Field keys are generated from labels and used as submission columns.
              </li>
              <li className="flex gap-2">
                <Icon.check size={13} className="mt-0.5 shrink-0 text-ceyteq-500" />
                Renaming a slug keeps the old links dead — share the new one.
              </li>
              <li className="flex gap-2">
                <Icon.check size={13} className="mt-0.5 shrink-0 text-ceyteq-500" />
                Publish after saving so visitors can submit.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Field editor                                                              */
/* -------------------------------------------------------------------------- */

const TYPE_OPTIONS = (Object.keys(FIELD_TYPE_META) as FieldType[]).map((type) => ({
  value: type,
  label: FIELD_TYPE_META[type].label,
}));

function FieldEditor({
  field,
  index,
  onChange,
}: {
  field: DraftField;
  index: number;
  onChange: (changes: Partial<DraftField>) => void;
}) {
  const needsOptions = field.type === "select" || field.type === "color-multi" || field.type === "links";

  const updateOption = (optionIndex: number, changes: Partial<FieldOption>) =>
    onChange({
      options: field.options.map((option, idx) =>
        idx === optionIndex ? { ...option, ...changes } : option,
      ),
    });

  return (
    <div className="mt-3 grid gap-3 border-t border-white/60 pt-3 sm:grid-cols-2">
      <div>
        <span className="label">Field type</span>
        <NeuSelect
          options={TYPE_OPTIONS}
          value={field.type}
          onChange={(type) => {
            const nextType = type as FieldType;
            const keepsOptions = nextType === "select" || nextType === "color-multi" || nextType === "links";
            onChange({
              type: nextType,
              options:
                keepsOptions && field.options.length > 0 ? field.options : defaultOptionsFor(nextType),
              config:
                nextType === "color-multi"
                  ? { ...field.config, maxSelections: 5, minSelections: 1 }
                  : nextType === "links"
                    ? { ...field.config, addLabel: "+ Add Another Link" }
                    : field.config,
            });
          }}
          ariaLabel="Field type"
          size="sm"
        />
      </div>

      <div>
        <label className="label" htmlFor={`field-key-${field.uid}`}>
          Field key
        </label>
        <input
          id={`field-key-${field.uid}`}
          className="neu-input !py-2.5 !text-[12.5px] font-mono"
          value={field.key}
          placeholder={slugifyKey(field.label, index)}
          onChange={(event) =>
            onChange({
              key: event.target.value
                .toLowerCase()
                .replace(/[^a-z0-9_]+/g, "_")
                .replace(/^_+|_+$/g, ""),
            })
          }
        />
      </div>

      <div>
        <label className="label" htmlFor={`field-placeholder-${field.uid}`}>
          Placeholder
        </label>
        <input
          id={`field-placeholder-${field.uid}`}
          className="neu-input !py-2.5 !text-[12.5px]"
          value={field.placeholder}
          onChange={(event) => onChange({ placeholder: event.target.value })}
        />
      </div>

      <div>
        <label className="label" htmlFor={`field-help-${field.uid}`}>
          Helper text
        </label>
        <input
          id={`field-help-${field.uid}`}
          className="neu-input !py-2.5 !text-[12.5px]"
          value={field.helpText}
          onChange={(event) => onChange({ helpText: event.target.value })}
        />
      </div>

      <div>
        <span className="label">Layout</span>
        <NeuSelect
          options={[
            { value: "full", label: "Full width" },
            { value: "half", label: "Half width" },
          ]}
          value={field.config.width ?? "full"}
          onChange={(width) =>
            onChange({ config: { ...field.config, width: width as FieldConfig["width"] } })
          }
          ariaLabel="Field layout"
          size="sm"
        />
      </div>

      {field.type === "text" || field.type === "textarea" ? (
        <div>
          <label className="label" htmlFor={`field-max-${field.uid}`}>
            Max characters
          </label>
          <input
            id={`field-max-${field.uid}`}
            type="number"
            min={1}
            className="neu-input !py-2.5 !text-[12.5px]"
            value={field.config.maxLength ?? ""}
            onChange={(event) =>
              onChange({
                config: {
                  ...field.config,
                  maxLength: event.target.value ? Number(event.target.value) : undefined,
                },
              })
            }
          />
        </div>
      ) : null}

      {field.type === "color-multi" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor={`field-max-sel-${field.uid}`}>
              Max selections
            </label>
            <input
              id={`field-max-sel-${field.uid}`}
              type="number"
              min={1}
              max={10}
              className="neu-input !py-2.5 !text-[12.5px]"
              value={field.config.maxSelections ?? 5}
              onChange={(event) =>
                onChange({ config: { ...field.config, maxSelections: Number(event.target.value) } })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor={`field-min-sel-${field.uid}`}>
              Min selections
            </label>
            <input
              id={`field-min-sel-${field.uid}`}
              type="number"
              min={0}
              max={10}
              className="neu-input !py-2.5 !text-[12.5px]"
              value={field.config.minSelections ?? 0}
              onChange={(event) =>
                onChange({ config: { ...field.config, minSelections: Number(event.target.value) } })
              }
            />
          </div>
        </div>
      ) : null}

      {field.type === "links" ? (
        <>
          <div>
            <label className="label" htmlFor={`field-add-label-${field.uid}`}>
              Add button label
            </label>
            <input
              id={`field-add-label-${field.uid}`}
              className="neu-input !py-2.5 !text-[12.5px]"
              value={field.config.addLabel ?? ""}
              onChange={(event) =>
                onChange({ config: { ...field.config, addLabel: event.target.value } })
              }
            />
          </div>
          <div>
            <label className="label" htmlFor={`field-empty-hint-${field.uid}`}>
              Empty state hint
            </label>
            <input
              id={`field-empty-hint-${field.uid}`}
              className="neu-input !py-2.5 !text-[12.5px]"
              value={field.config.emptyHint ?? ""}
              onChange={(event) =>
                onChange({ config: { ...field.config, emptyHint: event.target.value } })
              }
            />
          </div>
        </>
      ) : null}

      {needsOptions ? (
        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label !mb-0">
              {field.type === "links" ? "Platforms" : field.type === "color-multi" ? "Colours" : "Options"}
            </span>
            <button
              type="button"
              onClick={() =>
                onChange({
                  options: [
                    ...field.options,
                    {
                      value: `option-${field.options.length + 1}`,
                      label: `Option ${field.options.length + 1}`,
                      ...(field.type === "color-multi" ? { swatch: "#8C9BB0" } : {}),
                    },
                  ],
                })
              }
              className="neu-btn-ghost !py-1 !text-[11px]"
            >
              <Icon.plus size={12} />
              Add
            </button>
          </div>

          <div className="space-y-1.5">
            {field.options.map((option, optionIndex) => (
              <div key={`${field.uid}-opt-${optionIndex}`} className="flex items-center gap-1.5">
                {field.type === "color-multi" ? (
                  <input
                    type="color"
                    aria-label={`Colour ${optionIndex + 1}`}
                    value={option.swatch ?? "#8C9BB0"}
                    onChange={(event) => updateOption(optionIndex, { swatch: event.target.value })}
                    className="h-9 w-10 shrink-0 cursor-pointer rounded-lg bg-transparent p-0.5 shadow-neu-inset-sm"
                  />
                ) : null}
                <input
                  aria-label={`Label ${optionIndex + 1}`}
                  className="neu-input min-w-0 flex-1 !py-2 !text-[12px]"
                  value={option.label}
                  placeholder="Label"
                  onChange={(event) => updateOption(optionIndex, { label: event.target.value })}
                />
                <input
                  aria-label={`Value ${optionIndex + 1}`}
                  className="neu-input w-[120px] shrink-0 !py-2 !text-[12px] font-mono sm:w-[150px]"
                  value={option.value}
                  placeholder="value"
                  onChange={(event) =>
                    updateOption(optionIndex, {
                      value: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => onChange({ options: field.options.filter((_, idx) => idx !== optionIndex) })}
                  aria-label={`Remove option ${optionIndex + 1}`}
                  className="neu-btn h-8 w-8 shrink-0 !px-0 text-navy-300 hover:!text-rose-500"
                >
                  <Icon.close size={12} />
                </button>
              </div>
            ))}
            {field.options.length === 0 ? (
              <p className="rounded-lg bg-ash-100 px-3 py-2 text-[11.5px] font-semibold text-navy-300">
                No options yet — add at least one.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
