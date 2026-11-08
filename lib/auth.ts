import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getAppEnv, getVar } from "@/lib/env";

/*
 * Admin authentication is handled by Cloudflare Access (Zero Trust, free up to 50 users).
 * Access sits in front of /admin* and /api/admin*, asks staff to log in (e.g. one-time email code)
 * and forwards a signed JWT in the `Cf-Access-Jwt-Assertion` header. We verify that JWT on every
 * admin page, server action and API call, so even a misconfigured Access policy fails closed.
 *
 * Dev environment only: until Access is set up, an ADMIN_PASSWORD secret enables a simple password
 * login (/admin-login). It is ignored on staging and production and whenever Access is configured.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type AdminUser = { email: string };

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function isLocalHost(host: string | null) {
  if (!host) return false;
  const hostname = host.replace(/:\d+$/, "");
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export async function getAdmin(): Promise<AdminUser | null> {
  const h = await headers();

  // Local development: `next dev`, or `npm run preview` with ADMIN_DEV_BYPASS=1, on localhost only.
  if (isLocalHost(h.get("host"))) {
    const bypass = process.env.NODE_ENV === "development" || (await getVar("ADMIN_DEV_BYPASS")) === "1";
    if (bypass) return { email: "dev@localhost" };
  }

  const teamDomain = (await getVar("CF_ACCESS_TEAM_DOMAIN")).replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const audience = await getVar("CF_ACCESS_AUD");
  if (!teamDomain || !audience) {
    if (await isPasswordLoginEnabled()) {
      const cookie = (await cookies()).get(PASSWORD_COOKIE)?.value ?? "";
      const expected = await passwordToken();
      return expected && timingSafeEqual(cookie, expected) ? { email: "admin (password login)" } : null;
    }
    console.error("Admin auth is not configured: set CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD");
    return null;
  }

  const token = h.get("cf-access-jwt-assertion");
  if (!token) return null;

  const issuer = `https://${teamDomain}`;
  let jwks = jwksCache.get(issuer);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    jwksCache.set(issuer, jwks);
  }

  try {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience });
    const email = typeof payload.email === "string" ? payload.email : "";
    return email ? { email } : null;
  } catch (error) {
    console.error("Invalid Cloudflare Access token", error);
    return null;
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}

/**
 * For admin pages. Layouts and pages render in parallel in Next.js, so every admin page calls this
 * itself instead of relying on the layout's check.
 */
export async function ensureAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect((await isPasswordLoginEnabled()) ? "/admin-login" : "/access-denied");
  return admin;
}

/* ------------------------------------------------------------------ dev password login */

export const PASSWORD_COOKIE = "mcc_admin";

/** Password login is only possible on the dev environment, with ADMIN_PASSWORD set and Access not configured. */
export async function isPasswordLoginEnabled(): Promise<boolean> {
  const [appEnv, password, team, aud] = await Promise.all([
    getAppEnv(),
    getVar("ADMIN_PASSWORD"),
    getVar("CF_ACCESS_TEAM_DOMAIN"),
    getVar("CF_ACCESS_AUD"),
  ]);
  return appEnv === "dev" && password.length >= 8 && !(team && aud);
}

/** Cookie value: HMAC of a fixed label keyed by the password, so changing the password logs everyone out. */
export async function passwordToken(): Promise<string> {
  const password = await getVar("ADMIN_PASSWORD");
  if (!password) return "";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("mcc-dev-admin-v1"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
