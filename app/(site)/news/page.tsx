import type { Metadata } from "next";
import { NewsList } from "@/components/site/news-list";
import { getContent, getSettings } from "@/lib/db/queries";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, c] = await Promise.all([getSettings(), getContent()]);
  return {
    title: c.newsTitle,
    description: `Latest contracts, project starts and handovers from ${settings.companyName}.`,
    alternates: { canonical: "/news" },
  };
}

export default function NewsPage() {
  return <NewsList page={1} />;
}
