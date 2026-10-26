import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";
import { moduleByKey } from "@/lib/admin-modules";

export const metadata: Metadata = { title: "Web Studio" };

export default function WebStudioPage() {
  return (
    <ModulePlaceholder
      module={moduleByKey("web-studio")}
      planned={[
        {
          title: "Brand theme builder",
          copy: "Palette, typography and logo slots per client, generated from the onboarding answers.",
          icon: "palette",
        },
        {
          title: "Page blocks",
          copy: "Hero, menu, gallery and reservation sections that can be rearranged per venue.",
          icon: "layers",
        },
        {
          title: "Live preview",
          copy: "See the client storefront update as the theme changes, before it ships.",
          icon: "eye",
        },
      ]}
    />
  );
}
