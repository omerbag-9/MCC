import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { NewsList } from "@/components/site/news-list";
import { getContent, getSettings } from "@/lib/db/queries";

type Props = { params: Promise<{ n: string }> };

/** "2" -> 2; anything that isn't a whole number from 1 up is not a page. */
function pageNumber(n: string): number | null {
  return /^[1-9]\d{0,3}$/.test(n) ? Number(n) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = pageNumber((await params).n);
  const [settings, c] = await Promise.all([getSettings(), getContent()]);
  return {
    title: n ? `${c.newsTitle}, page ${n}` : c.newsTitle,
    description: `Latest contracts, project starts and handovers from ${settings.companyName}.`,
    alternates: { canonical: n ? `/news/page/${n}` : "/news" },
  };
}

export default async function NewsPageN({ params }: Props) {
  const n = pageNumber((await params).n);
  if (!n) notFound();
  if (n === 1) permanentRedirect("/news");
  return <NewsList page={n} />;
}
