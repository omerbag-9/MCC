import { timingSafeEqual } from "@/lib/auth";
import { getVar } from "@/lib/env";
import { revalidateSite } from "@/lib/revalidate";

/**
 * Called right after each deploy (see scripts/post-deploy.mjs) so the first visit to every page
 * renders fresh content from D1 instead of the placeholder pages produced at build time.
 */
export async function POST(request: Request) {
  const secret = await getVar("REVALIDATE_SECRET");
  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !timingSafeEqual(provided, secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateSite();
  return Response.json({ ok: true });
}

