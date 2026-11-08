import "server-only";
import { escapeHtml } from "@/lib/format";
import { getVar } from "@/lib/env";

type Email = { to: string[]; subject: string; html: string; text: string; replyTo?: string };

/**
 * Sends email through the Resend HTTP API (Workers can't use SMTP/nodemailer reliably).
 * Without RESEND_API_KEY (local dev) the email is logged instead. Returns true when sent.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const apiKey = await getVar("RESEND_API_KEY");
  const from = await getVar("EMAIL_FROM");
  if (!apiKey || !from || email.to.length === 0) {
    console.log("[email] not configured, would have sent:", email.subject, "to", email.to.join(", "));
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: email.replyTo,
    }),
  });
  if (!res.ok) {
    console.error("[email] Resend error", res.status, await res.text());
    return false;
  }
  return true;
}

export type LeadEmailData = {
  name: string;
  phone: string;
  email: string;
  serviceInterest: string;
  message: string;
  pageSource: string;
};

export async function sendLeadNotification(lead: LeadEmailData, adminUrl: string): Promise<boolean> {
  const to = (await getVar("LEADS_NOTIFY_TO"))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const rows: [string, string][] = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Service", lead.serviceInterest],
    ["Page", lead.pageSource],
    ["Message", lead.message],
  ];
  const filled = rows.filter(([, v]) => v);

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <h2 style="margin:0 0 16px">New website enquiry</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${filled
          .map(
            ([k, v]) =>
              `<tr><td style="color:#666;vertical-align:top"><b>${k}</b></td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:24px"><a href="${escapeHtml(adminUrl)}">Open in admin</a></p>
    </div>`;
  const text = `New website enquiry\n\n${filled.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${adminUrl}`;

  return sendEmail({
    to,
    subject: `New enquiry from ${lead.name}`,
    html,
    text,
    replyTo: lead.email || undefined,
  });
}
