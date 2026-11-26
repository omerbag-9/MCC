import { z } from "zod";

/** What the contact form must contain (see lib/actions/lead.ts). */
export const leadSchema = z
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

export type LeadData = z.infer<typeof leadSchema>;
