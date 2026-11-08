"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { sendLeadNotification } from "@/lib/email";
import { getSiteUrl } from "@/lib/env";
import { verifyTurnstile } from "@/lib/turnstile";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "email" | "message", string>>;
};

const leadSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(100),
    phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "Please enter a valid phone number"),
    email: z.union([z.literal(""), z.string().trim().email("Please enter a valid email").max(200)]),
    serviceInterest: z.string().trim().max(100),
    message: z.string().trim().max(3000, "Message is too long"),
    pageSource: z.string().trim().max(200).regex(/^\/[\w\-/]*$/).catch("/"),
  })
  .refine((v) => v.phone.replace(/\D/g, "").length >= 6 || v.email !== "", {
    message: "Please give us a phone number or an email so we can reply",
    path: ["phone"],
  });

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  // Honeypot: real users never see or fill this field.
  if (String(formData.get("website") ?? "") !== "") {
    return { status: "success" };
  }

  const parsed = leadSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    serviceInterest: formData.get("serviceInterest") ?? "",
    message: formData.get("message") ?? "",
    pageSource: formData.get("pageSource") ?? "/",
  });

  if (!parsed.success) {
    const fieldErrors: LeadFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<LeadFormState["fieldErrors"]>;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const h = await headers();
  const human = await verifyTurnstile(String(formData.get("cf-turnstile-response") ?? ""), h.get("cf-connecting-ip"));
  if (!human) {
    return { status: "error", message: "We couldn't verify you're human. Please try again." };
  }

  const data = parsed.data;
  try {
    const db = await getDb();
    const [row] = await db.insert(leads).values(data).returning({ id: leads.id });

    // Send the notification after responding, so the visitor isn't kept waiting.
    const siteUrl = await getSiteUrl();
    const notify = sendLeadNotification(data, `${siteUrl}/admin/leads/${row.id}`)
      .then(async (sent) => {
        if (sent) await db.update(leads).set({ emailSent: true }).where(eq(leads.id, row.id));
      })
      .catch((error) => console.error("Lead email failed", error));
    try {
      getCloudflareContext().ctx.waitUntil(notify);
    } catch {
      await notify;
    }
  } catch (error) {
    console.error("Saving lead failed", error);
    return { status: "error", message: "Something went wrong. Please call or WhatsApp us instead." };
  }

  return { status: "success" };
}
