import type { FieldConfig, FieldOption, FieldType } from "./types";
import { DEFAULT_PALETTE, DEFAULT_PLATFORMS } from "./types";

/**
 * The production onboarding form definition.
 *
 * This is the real Ceyteq Digital Race onboarding schema — it is created once by
 * `npm run db:seed` (or from the dashboard) and is afterwards fully editable in
 * the form builder. It intentionally contains no sample data: every field label,
 * placeholder and helper line is production copy.
 */

export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: FieldOption[];
  config?: FieldConfig;
};

export type TemplateSection = {
  title: string;
  description?: string;
  icon?: string;
  fields: TemplateField[];
};

export type FormTemplate = {
  name: string;
  slug: string;
  title: string;
  description: string;
  status: "draft" | "published";
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  sections: TemplateSection[];
};

export const ONBOARDING_TEMPLATE: FormTemplate = {
  name: "Restaurant Onboarding",
  slug: "restaurant-onboarding",
  title: "Restaurant Onboarding",
  description:
    "Register your restaurant with Ceyteq. We use these details to build your brand theme, digital storefront, map listing and social profile.",
  status: "published",
  submitLabel: "Submit Onboarding Details",
  successTitle: "Onboarding details received",
  successMessage:
    "Thank you. The Ceyteq team will review your details and contact you on WhatsApp about the next steps. Keep your reference number for any follow-up.",
  sections: [
    {
      title: "Restaurant Details",
      description: "The information customers will see on your listings and storefront.",
      icon: "store",
      fields: [
        {
          key: "restaurant_name",
          label: "Restaurant Name",
          type: "text",
          placeholder: "Registered trading name",
          required: true,
          config: { width: "half", autoComplete: "organization", maxLength: 120 },
        },
        {
          key: "location_name",
          label: "Location Name",
          type: "text",
          placeholder: "Branch or outlet name",
          required: true,
          config: { width: "half", maxLength: 120 },
        },
        {
          key: "address",
          label: "Address",
          type: "textarea",
          placeholder: "Street address, city and postal code",
          required: true,
          config: { maxLength: 400 },
        },
        {
          key: "nearby_city",
          label: "Nearby City",
          type: "text",
          placeholder: "Nearest city or town",
          required: true,
          config: { width: "half", maxLength: 80 },
        },
        {
          key: "phone_number",
          label: "Phone Number",
          type: "tel",
          placeholder: "+94 XX XXX XXXX",
          helpText: "The number customers should call for orders or enquiries.",
          required: true,
          config: { width: "half", autoComplete: "tel" },
        },
        {
          key: "whatsapp_number",
          label: "WhatsApp Number",
          type: "tel",
          placeholder: "+94 XX XXX XXXX",
          helpText: "Include the country code so the chat link works worldwide.",
          required: true,
          config: { width: "half" },
        },
        {
          key: "restaurant_email",
          label: "Restaurant Email Address",
          type: "email",
          placeholder: "orders@yourdomain.com",
          required: true,
          config: { width: "half", autoComplete: "email" },
        },
      ],
    },
    {
      title: "Owner Details",
      description: "We use these details for your account and agreement.",
      icon: "user",
      fields: [
        {
          key: "owner_name",
          label: "Owner Name",
          type: "text",
          placeholder: "Full name",
          required: true,
          config: { width: "half", autoComplete: "name", maxLength: 120 },
        },
        {
          key: "owner_email",
          label: "Owner Email Address",
          type: "email",
          placeholder: "name@yourdomain.com",
          required: true,
          config: { width: "half", autoComplete: "email" },
        },
        {
          key: "owner_phone",
          label: "Owner Phone Number",
          type: "tel",
          placeholder: "+94 XX XXX XXXX",
          required: true,
          config: { width: "half" },
        },
        {
          key: "owner_whatsapp",
          label: "Owner WhatsApp Number",
          type: "tel",
          placeholder: "+94 XX XXX XXXX",
          required: true,
          config: { width: "half" },
        },
      ],
    },
    {
      title: "Social Media & Maps",
      description: "Add each profile we should link from your storefront.",
      icon: "link",
      fields: [
        {
          key: "social_links",
          label: "Social Media & Maps Links",
          type: "links",
          required: true,
          helpText: "Choose the platform, paste the full link, then add as many as you need.",
          options: DEFAULT_PLATFORMS,
          config: {
            addLabel: "+ Add Another Link",
            emptyHint: "Google Maps, Facebook, Instagram, TikTok, TripAdvisor and more",
          },
        },
      ],
    },
    {
      title: "Theme Colors",
      description: "Choose up to five colours for your brand theme.",
      icon: "palette",
      fields: [
        {
          key: "theme_colors",
          label: "Preferred Brand Colours",
          type: "color-multi",
          required: true,
          helpText:
            "Select up to 5. Each colour can be customised during the brand review session.",
          options: DEFAULT_PALETTE,
          config: { maxSelections: 5, minSelections: 1 },
        },
      ],
    },
    {
      title: "Special Notes",
      description: "Anything else we should know before we build your digital presence.",
      icon: "notes",
      fields: [
        {
          key: "special_notes",
          label: "Special Notes",
          type: "textarea",
          placeholder: "Opening hours, delivery partners, menu highlights, accessibility needs…",
          helpText: "Optional, but the more we know the faster your launch.",
          config: { maxLength: 2000 },
        },
      ],
    },
  ],
};

/** Kept as a single-item list so the dashboard can enumerate starter forms. */
export const TEMPLATES: FormTemplate[] = [ONBOARDING_TEMPLATE];

export const RESTAURANT_TEMPLATE = ONBOARDING_TEMPLATE;
