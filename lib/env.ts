import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** True while `next build` pre-renders pages. We never touch D1/R2 then (see lib/db/queries.ts). */
export const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

export async function getBindings(): Promise<CloudflareEnv> {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

type StringVar =
  | "APP_ENV"
  | "SITE_URL"
  | "MEDIA_URL"
  | "EMAIL_FROM"
  | "LEADS_NOTIFY_TO"
  | "CF_ACCESS_TEAM_DOMAIN"
  | "CF_ACCESS_AUD"
  | "R2_ACCOUNT_ID"
  | "R2_BUCKET_NAME"
  | "R2_ACCESS_KEY_ID"
  | "R2_SECRET_ACCESS_KEY"
  | "RESEND_API_KEY"
  | "TURNSTILE_SITE_KEY"
  | "TURNSTILE_SECRET_KEY"
  | "REVALIDATE_SECRET"
  | "CF_ANALYTICS_TOKEN"
  | "ADMIN_DEV_BYPASS"
  | "ADMIN_PASSWORD";

/**
 * Reads a configuration value from the Worker environment (wrangler vars / secrets / .dev.vars),
 * falling back to process.env. Values are read at request time, never inlined at build time.
 */
export async function getVar(name: StringVar): Promise<string> {
  if (!isBuildPhase()) {
    try {
      const env = (await getBindings()) as unknown as Record<string, unknown>;
      const value = env[name];
      if (typeof value === "string" && value !== "") return value;
    } catch {
      // fall through to process.env
    }
  }
  return process.env[name] ?? "";
}

export async function getSiteUrl(): Promise<string> {
  return ((await getVar("SITE_URL")) || "http://localhost:3000").replace(/\/+$/, "");
}

/** Public base URL of the media bucket ("" = serve through the /media route). */
export async function getMediaBase(): Promise<string> {
  return getVar("MEDIA_URL");
}

export type AppEnv = "dev" | "staging" | "production";

/** Which deployment this is (APP_ENV in wrangler.jsonc). Local development counts as "dev". */
export async function getAppEnv(): Promise<AppEnv> {
  const value = await getVar("APP_ENV");
  return value === "production" || value === "staging" ? value : "dev";
}

/** The media bucket, or null where R2 isn't configured (dev runs without R2). */
export async function getMediaBucket(): Promise<R2Bucket | null> {
  if (isBuildPhase()) return null;
  try {
    return (await getBindings()).MEDIA ?? null;
  } catch {
    return null;
  }
}
