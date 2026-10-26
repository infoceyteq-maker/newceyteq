import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";
import { moduleByKey } from "@/lib/admin-modules";

export const metadata: Metadata = { title: "Websites" };

export default function WebsitesPage() {
  return (
    <ModulePlaceholder
      module={moduleByKey("websites")}
      planned={[
        {
          title: "Domain register",
          copy: "Every client domain, DNS status and renewal date in one table.",
          icon: "globe",
        },
        {
          title: "Deploy log",
          copy: "Track which storefront is on which release, with instant rollback.",
          icon: "stack",
        },
        {
          title: "Health checks",
          copy: "Uptime and Core Web Vitals per site, surfaced as neumorphic widgets.",
          icon: "shield",
        },
      ]}
    />
  );
}
