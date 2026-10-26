import "server-only";

import { listSubmissions } from "@/lib/services/submissions-service";

/**
 * Restaurant Clients module.
 *
 * A "client" is derived from an onboarding submission rather than stored twice:
 * the answers the venue submitted at /form/restaurant-onboarding are the client
 * record. Field keys are looked up by name with tolerant fallbacks so a form
 * edited in the builder still resolves.
 */

export type ClientRecord = {
  id: string;
  reference: string;
  status: string;
  receivedAt: string;
  formTitle: string;
  formSlug: string;
  restaurantName: string;
  locationName: string;
  nearbyCity: string;
  address: string;
  restaurantPhone: string;
  restaurantWhatsapp: string;
  restaurantEmail: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  links: Array<{ platform: string; url: string }>;
  themeColors: string[];
  notes: string;
  completeness: number;
};

const TEXT_KEYS: Record<string, string[]> = {
  restaurantName: ["restaurant_name", "restaurant", "business_name", "name"],
  locationName: ["location_name", "location", "branch", "outlet"],
  nearbyCity: ["nearby_city", "city", "town"],
  address: ["address", "full_address"],
  restaurantPhone: ["phone_number", "restaurant_phone", "phone", "contact_number"],
  restaurantWhatsapp: ["whatsapp_number", "restaurant_whatsapp", "whatsapp"],
  restaurantEmail: ["restaurant_email", "email", "contact_email"],
  ownerName: ["owner_name", "proprietor", "owner"],
  ownerEmail: ["owner_email"],
  ownerPhone: ["owner_phone", "owner_contact"],
  ownerWhatsapp: ["owner_whatsapp"],
  notes: ["special_notes", "notes", "remarks"],
};

function pick(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function pickArray(data: Record<string, unknown>, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = data[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function extractLinks(data: Record<string, unknown>) {
  return pickArray(data, ["social_links", "links", "social", "profiles"])
    .map((item) => {
      if (typeof item === "string") return { platform: "website", url: item };
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return {
          platform: String(record.platform ?? "website"),
          url: String(record.url ?? ""),
        };
      }
      return null;
    })
    .filter((item): item is { platform: string; url: string } => !!item && !!item.url);
}

function extractColors(data: Record<string, unknown>) {
  return pickArray(data, ["theme_colors", "colors", "brand_colors", "palette"])
    .filter((value): value is string => typeof value === "string")
    .slice(0, 12);
}

function completenessOf(client: Omit<ClientRecord, "completeness">) {
  const checks = [
    client.restaurantName,
    client.locationName,
    client.nearbyCity,
    client.address,
    client.restaurantPhone,
    client.restaurantWhatsapp,
    client.restaurantEmail,
    client.ownerName,
    client.ownerEmail,
    client.ownerPhone,
    client.ownerWhatsapp,
  ];
  const filled = checks.filter(Boolean).length;
  const links = client.links.length > 0 ? 1 : 0;
  const colors = client.themeColors.length > 0 ? 1 : 0;
  return Math.round(((filled + links + colors) / (checks.length + 2)) * 100);
}

export async function listClients(options: {
  status?: string;
  query?: string;
  take?: number;
} = {}): Promise<ClientRecord[]> {
  const submissions = await listSubmissions({
    status: options.status,
    query: options.query,
    take: options.take ?? 300,
  });

  return submissions.map((submission) => {
    const data = submission.data;
    const base = {
      id: submission.id,
      reference: submission.reference,
      status: submission.status,
      receivedAt: submission.createdAt,
      formTitle: submission.formTitle,
      formSlug: submission.formSlug,
      restaurantName: pick(data, TEXT_KEYS.restaurantName),
      locationName: pick(data, TEXT_KEYS.locationName),
      nearbyCity: pick(data, TEXT_KEYS.nearbyCity),
      address: pick(data, TEXT_KEYS.address),
      restaurantPhone: pick(data, TEXT_KEYS.restaurantPhone),
      restaurantWhatsapp: pick(data, TEXT_KEYS.restaurantWhatsapp),
      restaurantEmail: pick(data, TEXT_KEYS.restaurantEmail),
      ownerName: pick(data, TEXT_KEYS.ownerName),
      ownerEmail: pick(data, TEXT_KEYS.ownerEmail),
      ownerPhone: pick(data, TEXT_KEYS.ownerPhone),
      ownerWhatsapp: pick(data, TEXT_KEYS.ownerWhatsapp),
      links: extractLinks(data),
      themeColors: extractColors(data),
      notes: pick(data, TEXT_KEYS.notes),
    };

    return { ...base, completeness: completenessOf(base) };
  });
}

export function clientStats(clients: ClientRecord[]) {
  const withLinks = clients.filter((client) => client.links.length > 0).length;
  const withPalette = clients.filter((client) => client.themeColors.length > 0).length;
  const cities = new Set(clients.map((client) => client.nearbyCity).filter(Boolean));
  const average = clients.length
    ? Math.round(clients.reduce((total, client) => total + client.completeness, 0) / clients.length)
    : 0;

  return { total: clients.length, withLinks, withPalette, cities: cities.size, average };
}
