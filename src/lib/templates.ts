import type { FieldConfig, FieldOption, FieldType } from "./types";
import { DEFAULT_PALETTE, DEFAULT_PLATFORMS } from "./types";

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

export const RESTAURANT_TEMPLATE: FormTemplate = {
  name: "Restaurant Onboarding",
  slug: "restaurant-onboarding",
  title: "Restaurant Onboarding",
  description:
    "Tell us about your venue so the Ceyteq team can launch your digital storefront, brand theme and map listing.",
  status: "published",
  submitLabel: "Submit Onboarding Details",
  successTitle: "Welcome to the Digital Race",
  successMessage:
    "Your restaurant profile is in. The Ceyteq team will review your details, build your brand theme and contact you on WhatsApp within two working days.",
  sections: [
    {
      title: "Restaurant Details",
      description: "The public-facing information customers will see.",
      icon: "store",
      fields: [
        {
          key: "restaurant_name",
          label: "Restaurant Name",
          type: "text",
          placeholder: "e.g. The Lagoon Kitchen",
          required: true,
          config: { width: "half", autoComplete: "organization" },
        },
        {
          key: "location_name",
          label: "Location Name",
          type: "text",
          placeholder: "e.g. Marine Drive Branch",
          required: true,
          config: { width: "half" },
        },
        {
          key: "address",
          label: "Address",
          type: "textarea",
          placeholder: "No. 24, Marine Drive, Colombo 03",
          required: true,
          config: { maxLength: 400 },
        },
        {
          key: "nearby_city",
          label: "Nearby City",
          type: "text",
          placeholder: "e.g. Colombo",
          required: true,
          config: { width: "half" },
        },
        {
          key: "phone_number",
          label: "Phone Number",
          type: "tel",
          placeholder: "+94 11 234 5678",
          required: true,
          config: { width: "half", autoComplete: "tel" },
        },
        {
          key: "whatsapp_number",
          label: "WhatsApp Number",
          type: "tel",
          placeholder: "+94 77 123 4567",
          required: true,
          config: { width: "half" },
        },
        {
          key: "restaurant_email",
          label: "Restaurant Email Address",
          type: "email",
          placeholder: "hello@lagoonkitchen.lk",
          required: true,
          config: { width: "half", autoComplete: "email" },
        },
      ],
    },
    {
      title: "Owner Details",
      description: "Who we speak to about the account.",
      icon: "user",
      fields: [
        {
          key: "owner_name",
          label: "Owner Name",
          type: "text",
          placeholder: "Full name",
          required: true,
          config: { width: "half", autoComplete: "name" },
        },
        {
          key: "owner_email",
          label: "Owner Email Address",
          type: "email",
          placeholder: "owner@example.com",
          required: true,
          config: { width: "half", autoComplete: "email" },
        },
        {
          key: "owner_phone",
          label: "Owner Phone Number",
          type: "tel",
          placeholder: "+94 71 234 5678",
          required: true,
          config: { width: "half" },
        },
        {
          key: "owner_whatsapp",
          label: "Owner WhatsApp Number",
          type: "tel",
          placeholder: "+94 71 234 5678",
          required: true,
          config: { width: "half" },
        },
      ],
    },
    {
      title: "Social Media & Maps",
      description: "Add every profile we should link from your storefront.",
      icon: "link",
      fields: [
        {
          key: "social_links",
          label: "Social Media & Maps Links",
          type: "links",
          required: true,
          helpText: "Pick a platform, paste the full link, then add as many as you like.",
          options: DEFAULT_PLATFORMS,
          config: {
            addLabel: "+ Add Another Link",
            emptyHint: "Google Maps, Facebook, Instagram, TikTok or TripAdvisor",
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
          helpText: "Select up to 5. We use these for your storefront, receipts and social templates.",
          options: DEFAULT_PALETTE,
          config: { maxSelections: 5, minSelections: 1 },
        },
      ],
    },
    {
      title: "Special Notes",
      description: "Anything else we should know before we build?",
      icon: "notes",
      fields: [
        {
          key: "special_notes",
          label: "Special Notes",
          type: "textarea",
          placeholder: "Menu highlights, opening hours, delivery partners, accessibility needs…",
          helpText: "Optional — but the more we know, the faster we launch.",
          config: { maxLength: 2000 },
        },
      ],
    },
  ],
};

export const PARTNER_TEMPLATE: FormTemplate = {
  name: "Delivery Partner Application",
  slug: "delivery-partner-application",
  title: "Delivery Partner Application",
  description: "Join the Ceyteq delivery network. We review every application within 48 hours.",
  status: "draft",
  submitLabel: "Submit Application",
  successTitle: "Application received",
  successMessage: "Thanks for applying. Our operations team will call you within 48 hours.",
  sections: [
    {
      title: "Applicant Details",
      icon: "user",
      fields: [
        { key: "full_name", label: "Full Name", type: "text", required: true, config: { width: "half" } },
        { key: "email", label: "Email Address", type: "email", required: true, config: { width: "half" } },
        { key: "phone", label: "Phone Number", type: "tel", required: true, config: { width: "half" } },
        {
          key: "city",
          label: "Operating City",
          type: "select",
          required: true,
          config: { width: "half" },
          options: [
            { value: "colombo", label: "Colombo" },
            { value: "kandy", label: "Kandy" },
            { value: "galle", label: "Galle" },
            { value: "jaffna", label: "Jaffna" },
          ],
        },
        {
          key: "vehicle",
          label: "Notes",
          type: "textarea",
          placeholder: "Vehicle type, availability, experience…",
        },
      ],
    },
  ],
};

export const TEMPLATES: FormTemplate[] = [RESTAURANT_TEMPLATE, PARTNER_TEMPLATE];
