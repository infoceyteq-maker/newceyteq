/**
 * Lead channel vocabulary shared by the public enquiry form and the admin
 * "Social Media Leads & Inquiries" module.
 *
 * `source` groups channels for reporting: social platforms, email, phone and
 * website enquiries.
 */

export type LeadSource = "social" | "email" | "phone" | "website";

export type LeadChannel = {
  value: string;
  label: string;
  source: LeadSource;
};

export const LEAD_CHANNELS: LeadChannel[] = [
  { value: "facebook", label: "Facebook", source: "social" },
  { value: "instagram", label: "Instagram", source: "social" },
  { value: "tiktok", label: "TikTok", source: "social" },
  { value: "linkedin", label: "LinkedIn", source: "social" },
  { value: "youtube", label: "YouTube", source: "social" },
  { value: "pinterest", label: "Pinterest", source: "social" },
  { value: "x", label: "X (Twitter)", source: "social" },
  { value: "google-maps", label: "Google Maps", source: "website" },
  { value: "whatsapp", label: "WhatsApp", source: "phone" },
  { value: "email", label: "Email", source: "email" },
  { value: "phone", label: "Phone call", source: "phone" },
  { value: "website", label: "Website", source: "website" },
  { value: "referral", label: "Referral", source: "website" },
];

export const LEAD_SOURCES: Array<{ value: LeadSource; label: string }> = [
  { value: "social", label: "Social media" },
  { value: "email", label: "Email" },
  { value: "phone", label: "WhatsApp & phone" },
  { value: "website", label: "Website & search" },
];

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "won", label: "Won" },
  { value: "archived", label: "Archived" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export function leadChannel(value: string): LeadChannel | undefined {
  return LEAD_CHANNELS.find((channel) => channel.value === value);
}

export function leadChannelLabel(value: string) {
  return leadChannel(value)?.label ?? "Website";
}

export function leadSourceLabel(value: string) {
  return LEAD_SOURCES.find((source) => source.value === value)?.label ?? "Website & search";
}

/** Icon hint for a channel, mapped onto the app icon set. */
export function leadChannelIcon(value: string) {
  switch (value) {
    case "facebook":
    case "instagram":
    case "tiktok":
    case "linkedin":
    case "youtube":
    case "pinterest":
    case "x":
      return value as "facebook";
    case "whatsapp":
      return "whatsapp" as const;
    case "email":
      return "mail" as const;
    case "phone":
      return "phone" as const;
    case "google-maps":
      return "map" as const;
    default:
      return "globe" as const;
  }
}
