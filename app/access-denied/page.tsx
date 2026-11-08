import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Access denied", robots: { index: false } };

export default function AccessDenied() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold">Access denied</h1>
      <p className="mt-3 max-w-md text-muted">
        The admin area is protected by Cloudflare Access. Sign in with an approved email address, or ask the site owner to add you.
      </p>
      <Link href="/" className="btn-primary mt-8">Back to the website</Link>
    </main>
  );
}
