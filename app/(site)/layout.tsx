import Script from "next/script";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { photoPool } from "@/components/site/photo";
import { WhatsAppFloat } from "@/components/site/whatsapp";
import { getFeaturedProjects, getSettings } from "@/lib/db/queries";
import { getMediaBase, getVar } from "@/lib/env";
import { whatsappLink } from "@/lib/whatsapp";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, featured, mediaBase, analyticsToken] = await Promise.all([
    getSettings(),
    getFeaturedProjects(),
    getMediaBase(),
    getVar("CF_ANALYTICS_TOKEN"),
  ]);
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);
  // The footer closes on the last featured project's photograph (the hero uses the first).
  const pool = photoPool(...[...featured].reverse().map((p) => p.coverKey), settings.heroImageKey);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header companyName={settings.companyName} />
      <main id="main">{children}</main>
      <Footer settings={settings} photo={pool.next()} mediaBase={mediaBase} />
      {wa && <WhatsAppFloat href={wa} />}
      {analyticsToken && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: analyticsToken })}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
