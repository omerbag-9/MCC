import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink px-5 text-center text-paper">
      <h1 className="text-display font-semibold">Page not found</h1>
      <p className="mt-4 text-on-navy-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-light">Go home</Link>
        <Link href="/projects" className="btn-outline">View projects</Link>
      </div>
    </main>
  );
}
