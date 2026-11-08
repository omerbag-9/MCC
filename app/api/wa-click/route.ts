import { getDb } from "@/lib/db/client";
import { whatsappClicks } from "@/lib/db/schema";

/** Counts WhatsApp button clicks per page (shown on the admin dashboard). */
export async function POST(request: Request) {
  try {
    const data = (await request.json().catch(() => ({}))) as { page?: unknown };
    const page = typeof data.page === "string" && /^\/[\w\-/]{0,199}$/.test(data.page) ? data.page : "/";
    const db = await getDb();
    await db.insert(whatsappClicks).values({ pageSource: page });
  } catch (error) {
    console.error("wa-click failed", error);
  }
  return new Response(null, { status: 204 });
}
