import Script from "next/script";
import { Footer } from "@/components/site/footer";
import { Header, TopBar } from "@/components/site/header";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { WhatsAppFloat } from "@/components/site/whatsapp";
import { getFeaturedProjects, getPublishedServices, getSettings } from "@/lib/db/queries";
import { getVar } from "@/lib/env";
import { whatsappLink } from "@/lib/whatsapp";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services, projects, analyticsToken] = await Promise.all([
    getSettings(),
    getPublishedServices(),
    getFeaturedProjects(),
    getVar("CF_ANALYTICS_TOKEN"),
  ]);
  const wa = whatsappLink(settings.whatsappNumber, settings.whatsappMessage);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <ScrollToTop />
      <TopBar settings={settings} />
      <Header companyName={settings.companyName} phone={settings.phone} />
      <main id="main">{children}</main>
      <Footer settings={settings} services={services} projects={projects} />
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
