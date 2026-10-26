import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ceyteq Digital Race — Empowering Digital Evolution",
    template: "%s · Ceyteq Digital Race",
  },
  description:
    "The Ceyteq Digital Race platform: dynamic onboarding forms, brand themes and secure submissions for restaurants joining the digital race.",
  applicationName: "Ceyteq Digital Race",
  keywords: [
    "Ceyteq",
    "Digital Race",
    "restaurant onboarding",
    "dynamic forms",
    "Neumorphism",
    "Next.js",
    "Supabase",
    "Prisma",
  ],
  authors: [{ name: "Ceyteq" }],
  icons: {
    icon: [{ url: "/brand/ceyteq-mark.png", type: "image/png" }],
    apple: [{ url: "/brand/ceyteq-mark.png" }],
  },
  openGraph: {
    title: "Ceyteq Digital Race",
    description:
      "Launch your restaurant's digital identity in one soft, five-minute onboarding flow.",
    type: "website",
    url: siteUrl,
    siteName: "Ceyteq Digital Race",
    images: [{ url: "/brand/ceyteq-logo.png", width: 900, height: 378, alt: "Ceyteq" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceyteq Digital Race",
    description: "Empowering Digital Evolution — dynamic onboarding for every restaurant.",
    images: ["/brand/ceyteq-logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E9EDF3",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh overflow-x-hidden">{children}</body>
    </html>
  );
}
