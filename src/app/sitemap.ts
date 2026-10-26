import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let formUrls: MetadataRoute.Sitemap = [];
  try {
    const { listForms } = await import("@/lib/repos/forms");
    const forms = await listForms();
    formUrls = forms
      .filter((form) => form.status === "published")
      .map((form) => ({
        url: `${base}/form/${form.slug}`,
        lastModified: new Date(form.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    formUrls = [];
  }

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    ...formUrls,
  ];
}
