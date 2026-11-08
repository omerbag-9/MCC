import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { getSettings } from "@/lib/db/queries";
import { getSiteUrl } from "@/lib/env";
import { siteDescription, siteTitle } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  const title = siteTitle(settings);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${settings.companyName}` },
    description: siteDescription(settings),
    openGraph: { type: "website", siteName: settings.companyName, locale: "en_US" },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#14161a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
