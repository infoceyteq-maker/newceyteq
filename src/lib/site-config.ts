/**
 * Official Ceyteq contact details and social profiles.
 *
 * Single source of truth for every link rendered in the UI (header, footer,
 * contact section, form confirmation screen). Update here and the whole app
 * follows — no links are hard-coded inside components.
 */

export type SocialLink = {
  id: string;
  label: string;
  handle: string;
  href: string;
  icon:
    | "facebook"
    | "instagram"
    | "linkedin"
    | "pinterest"
    | "tiktok"
    | "youtube"
    | "x"
    | "whatsapp";
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "facebook",
    label: "Facebook",
    handle: "/ceyteq",
    href: "https://www.facebook.com/share/1KM2kZvaCC/",
    icon: "facebook",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@ceyteq",
    href: "https://www.instagram.com/ceyteq/",
    icon: "instagram",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Ceylon Technology",
    href: "https://www.linkedin.com/in/ceylon-technology",
    icon: "linkedin",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    handle: "@infoceyteq",
    href: "https://www.pinterest.com/infoceyteq/",
    icon: "pinterest",
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: "@ceyteq",
    href: "https://www.tiktok.com/@ceyteq?lang=en-GB",
    icon: "tiktok",
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "Ceylon Technology",
    href: "https://youtube.com/@ceylontechnology-ceyteq?si=a4L-B_OZjvhjO7sw",
    icon: "youtube",
  },
  {
    id: "x",
    label: "X (Twitter)",
    handle: "@CeylonTech22598",
    href: "https://x.com/CeylonTech22598",
    icon: "x",
  },
];

export type ContactChannel = {
  id: "hotline" | "whatsapp" | "mobile" | "email";
  label: string;
  value: string;
  href: string;
  hint: string;
  icon: "phone" | "whatsapp" | "mail";
  /** Opens in a new tab (WhatsApp only). */
  external?: boolean;
};

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: "hotline",
    label: "Hotline",
    value: "+94 78 860 7143",
    href: "tel:+94788607143",
    hint: "Call the Ceyteq team",
    icon: "phone",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+94 78 860 7143",
    href: "https://wa.me/94788607143",
    hint: "Message us instantly",
    icon: "whatsapp",
    external: true,
  },
  {
    id: "mobile",
    label: "Mobile",
    value: "+94 76 860 7143",
    href: "tel:+94768607143",
    hint: "Direct line for onboarding",
    icon: "phone",
  },
  {
    id: "email",
    label: "Email",
    value: "info.ceyteq@gmail.com",
    href: "mailto:info.ceyteq@gmail.com",
    hint: "Documents and enquiries",
    icon: "mail",
  },
];

export const CONTACT = {
  hotlineTel: "tel:+94788607143",
  mobileTel: "tel:+94768607143",
  whatsapp: "https://wa.me/94788607143",
  email: "mailto:info.ceyteq@gmail.com",
  emailAddress: "info.ceyteq@gmail.com",
} as const;

export const SITE = {
  name: "Ceyteq Digital Race",
  company: "Ceyteq — Ceylon Technology",
  tagline: "Empowering Digital Evolution",
  description:
    "Ceyteq helps restaurants and local businesses launch a complete digital identity — brand theme, listings, storefront and social presence — from one guided onboarding form.",
  /** Slug of the production onboarding form created by `npm run db:seed`. */
  onboardingSlug: "restaurant-onboarding",
} as const;

export function socialById(id: SocialLink["id"]) {
  return SOCIAL_LINKS.find((link) => link.id === id);
}
