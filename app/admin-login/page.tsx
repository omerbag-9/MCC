import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPasswordLoginEnabled } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

/** Dev environment only (see lib/auth.ts). Everywhere else this page doesn't exist. */
export default async function AdminLoginPage() {
  if (!(await isPasswordLoginEnabled())) notFound();
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-line">
        <h1 className="text-xl font-bold">Admin login</h1>
        <p className="mt-2 text-sm text-muted">Development environment</p>
        <LoginForm />
      </div>
    </main>
  );
}
