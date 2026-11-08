"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isPasswordLoginEnabled, PASSWORD_COOKIE, passwordToken, timingSafeEqual } from "@/lib/auth";
import { getVar } from "@/lib/env";

export async function adminLogin(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  if (!(await isPasswordLoginEnabled())) return { error: "Password login is not available here." };

  const given = String(formData.get("password") ?? "");
  const password = await getVar("ADMIN_PASSWORD");
  if (!timingSafeEqual(given, password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "Wrong password." };
  }

  (await cookies()).set(PASSWORD_COOKIE, await passwordToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/admin");
}

export async function adminLogout() {
  (await cookies()).delete(PASSWORD_COOKIE);
  redirect("/admin-login");
}
