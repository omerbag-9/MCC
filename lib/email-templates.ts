import { escapeHtml } from "./format.ts";

export type CompanyContact = { companyName: string; phone: string; email: string; siteUrl: string };

/**
 * The "we received your message" email sent to someone who filled in the contact form.
 *
 * It deliberately contains nothing the visitor typed (not even their name): anyone can enter any
 * email address in the form, so echoing their text would let the form be used to send spam from our
 * domain. Only our own company details go in.
 */
export function leadConfirmationEmail(c: CompanyContact): { subject: string; html: string; text: string } {
  const company = c.companyName || "our team";
  const contact = [c.phone && `Phone: ${c.phone}`, c.email && `Email: ${c.email}`].filter(Boolean) as string[];
  const subject = `We received your message | ${c.companyName}`.replace(/ \| $/, "");
  const text = [
    "Hello,",
    "",
    `Thank you for contacting ${company}. We have received your message and one of our team will get back to you soon, usually within one working day.`,
    "",
    ...(contact.length ? ["If it's urgent, you can reach us directly:", ...contact, ""] : []),
    c.siteUrl,
    "",
    `If you didn't send a message through our website, you can ignore this email.`,
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#042630;max-width:560px">
      <p>Hello,</p>
      <p>Thank you for contacting ${escapeHtml(company)}. We have received your message and one of our team will get back to you soon, usually within one working day.</p>
      ${
        contact.length
          ? `<p>If it's urgent, you can reach us directly:<br>${[
              c.phone && `Phone: <a href="tel:${escapeHtml(c.phone.replace(/\s/g, ""))}" style="color:#042630">${escapeHtml(c.phone)}</a>`,
              c.email && `Email: <a href="mailto:${escapeHtml(c.email)}" style="color:#042630">${escapeHtml(c.email)}</a>`,
            ]
              .filter(Boolean)
              .join("<br>")}</p>`
          : ""
      }
      <p><a href="${escapeHtml(c.siteUrl)}" style="color:#042630">${escapeHtml(c.siteUrl.replace(/^https?:\/\//, ""))}</a></p>
      <p style="color:#4a6470;font-size:13px">If you didn't send a message through our website, you can ignore this email.</p>
    </div>`;
  return { subject, html, text };
}
