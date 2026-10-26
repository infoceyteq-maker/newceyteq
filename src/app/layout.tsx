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
    "Supabase",
  ],
  authors: [{ name: "Ceyteq" }],
  icons: {
    icon: [
      { url: "/brand/ceyteq-mark.svg", type: "image/svg+xml" },
      { url: "/brand/ceyteq-mark.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
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
  themeColor: "#CBD5E1",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-screen bg-ash-300">
      <body className="min-h-screen overflow-x-hidden bg-ash-300">{children}</body>
    </html>
  );
}
