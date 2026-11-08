import "server-only";
import { getVar } from "@/lib/env";

export async function verifyTurnstile(token: string, ip?: string | null): Promise<boolean> {
  const secret = await getVar("TURNSTILE_SECRET_KEY");
  if (!secret) {
    // Not configured: allow in development only.
    return process.env.NODE_ENV === "development";
  }
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}
