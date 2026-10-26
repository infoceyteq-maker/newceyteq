/** Shared form-schema types used by the builder, the renderer and the API. */

export const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "url",
  "number",
  "textarea",
  "select",
  "color-multi",
  "links",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldOption = {
  /** Stable value stored in the submission. */
  value: string;
  /** Human label shown in the UI. */
  label: string;
  /** Optional hex swatch, used by `color-multi`. */
  swatch?: string;
  /** Optional glyph hint, used by `links`. */
  hint?: string;
};

export type FieldConfig = {
  /** color-multi: maximum number of selectable swatches. */
  maxSelections?: number;
  /** color-multi: minimum number of selectable swatches. */
  minSelections?: number;
  /** links: label for the add-another button. */
  addLabel?: string;
  /** links: text of the empty repeatable row placeholder. */
  emptyHint?: string;
  /** textarea / text: suggested character budget (UI only). */
  maxLength?: number;
  /** select / links: allow values that are not in the option list. */
  allowCustom?: boolean;
  /** text-like inputs: autocomplete token for the browser. */
  autoComplete?: string;
  /** Multi-column layout on wide screens. */
  width?: "full" | "half";
};

export type FormFieldDTO = {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  placeholder: string;
  helpText: string;
  required: boolean;
  position: number;
  options: FieldOption[];
  config: FieldConfig;
};

export type FormSectionDTO = {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: number;
  fields: FormFieldDTO[];
};

export type FormDTO = {
  id: string;
  slug: string;
  title: string;
  description: string;
  successTitle: string;
  successMessage: string;
  submitLabel: string;
  status: "draft" | "published" | "archived";
  accent: string;
  createdAt: string;
  updatedAt: string;
  sections: FormSectionDTO[];
};

export type SubmissionStatus = "new" | "reviewed" | "archived";

export type LinkValue = { platform: string; url: string };

export type SubmissionValue = string | string[] | LinkValue[] | number | null;

export type SubmissionData = Record<string, SubmissionValue>;

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; hint: string; icon: string; singleton?: boolean }
> = {
  text: { label: "Short text", hint: "Single line free text", icon: "type" },
  email: { label: "Email address", hint: "Validated email input", icon: "mail" },
  tel: { label: "Phone number", hint: "Dial-friendly phone input", icon: "phone" },
  url: { label: "URL", hint: "A single validated web link", icon: "link" },
  number: { label: "Number", hint: "Numeric input", icon: "hash" },
  textarea: { label: "Long text", hint: "Multi-line notes", icon: "notes" },
  select: { label: "Dropdown", hint: "Pick one from a list", icon: "chevron" },
  "color-multi": {
    label: "Colour picker",
    hint: "Pick up to N brand colours",
    icon: "palette",
    singleton: true,
  },
  links: {
    label: "Repeatable links",
    hint: "Platform dropdown + URL, add more",
    icon: "stack",
    singleton: true,
  },
};

/** Default brand swatches offered by the theme-colour field. */
export const DEFAULT_PALETTE: FieldOption[] = [
  { value: "ceyteq-blue", label: "Ceyteq Blue", swatch: "#0072CE" },
  { value: "deep-navy", label: "Deep Navy", swatch: "#082B49" },
  { value: "sky", label: "Sky", swatch: "#00A9E0" },
  { value: "aqua", label: "Aqua", swatch: "#33D6C0" },
  { value: "indigo", label: "Indigo", swatch: "#7B61FF" },
  { value: "rose", label: "Rose", swatch: "#E84C88" },
  { value: "sunset", label: "Sunset", swatch: "#FF7A45" },
  { value: "gold", label: "Gold", swatch: "#FFC93C" },
  { value: "emerald", label: "Emerald", swatch: "#2ECC71" },
  { value: "slate", label: "Slate", swatch: "#8C9BB0" },
];

/** Default platform list offered by the social/maps links field. */
export const DEFAULT_PLATFORMS: FieldOption[] = [
  { value: "google-maps", label: "Google Maps", hint: "map" },
  { value: "facebook", label: "Facebook", hint: "facebook" },
  { value: "instagram", label: "Instagram", hint: "instagram" },
  { value: "tiktok", label: "TikTok", hint: "tiktok" },
  { value: "youtube", label: "YouTube", hint: "youtube" },
  { value: "linkedin", label: "LinkedIn", hint: "linkedin" },
  { value: "pinterest", label: "Pinterest", hint: "pinterest" },
  { value: "x", label: "X (Twitter)", hint: "x" },
  { value: "tripadvisor", label: "TripAdvisor", hint: "tripadvisor" },
  { value: "website", label: "Website", hint: "globe" },
];

export const SECTION_ICONS = [
  "store",
  "user",
  "link",
  "palette",
  "notes",
  "spark",
  "phone",
  "mail",
  "globe",
  "shield",
] as const;
