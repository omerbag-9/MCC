import type { Metadata, Viewport } from "next";
import "@fontsource-variable/hanken-grotesk";
import "./globals.css";
import { getSettings } from "@/lib/db/queries";
import { getAppEnv, getSiteUrl } from "@/lib/env";
import { siteDescription, siteTitle } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteUrl, appEnv] = await Promise.all([getSettings(), getSiteUrl(), getAppEnv()]);
  const title = siteTitle(settings);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${settings.companyName}` },
    description: siteDescription(settings),
    openGraph: { type: "website", siteName: settings.companyName, locale: "en_US" },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/icon.svg" },
    // Only production may be indexed; dev and staging are noindex.
    ...(appEnv !== "production" && { robots: { index: false, follow: false } }),
  };
}

export const viewport: Viewport = {
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Lets CSS hide content that will fade in, only when scripts actually run. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
