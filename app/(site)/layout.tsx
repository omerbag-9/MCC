import Script from "next/script";
import { Footer } from "@/components/site/footer";
import { Header, TopBar } from "@/components/site/header";
import { WhatsAppFloat } from "@/components/site/whatsapp";
import { getContent, getFeaturedProjects, getPublishedServices, getSettings } from "@/lib/db/queries";
import { getVar } from "@/lib/env";
import { whatsappLink } from "@/lib/whatsapp";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, content, services, projects, analyticsToken] = await Promise.all([
    getSettings(),
    getContent(),
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
      <TopBar settings={settings} />
      <Header companyName={settings.companyName} phone={settings.phone} quoteLabel={content.quoteButton} />
      <main id="main">{children}</main>
      <Footer settings={settings} services={services} projects={projects} quoteLabel={content.quoteButton} />
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
