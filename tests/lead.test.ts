import { test } from "node:test";
import assert from "node:assert/strict";
import { leadSchema } from "../lib/lead.ts";
import { leadConfirmationEmail } from "../lib/email-templates.ts";

const base = { name: "Sara Ali", phone: "", email: "", serviceInterest: "", message: "", pageSource: "/contact" };

test("a lead needs a phone number or an email", () => {
  assert.ok(!leadSchema.safeParse(base).success);
  assert.ok(leadSchema.safeParse({ ...base, phone: "+20 107 075 6325" }).success);
  assert.ok(leadSchema.safeParse({ ...base, email: "sara@example.com" }).success);
});

test("lead fields are checked", () => {
  assert.ok(!leadSchema.safeParse({ ...base, name: "S", email: "sara@example.com" }).success);
  assert.ok(!leadSchema.safeParse({ ...base, email: "not-an-email" }).success);
  assert.ok(!leadSchema.safeParse({ ...base, phone: "call me 123456" }).success);
  assert.ok(!leadSchema.safeParse({ ...base, email: "sara@example.com", message: "x".repeat(3001) }).success);
});

test("an odd page source falls back to /", () => {
  const parsed = leadSchema.parse({ ...base, email: "sara@example.com", pageSource: "https://evil.example" });
  assert.equal(parsed.pageSource, "/");
});

test("the confirmation email holds only our own details", () => {
  const mail = leadConfirmationEmail({ companyName: "MCC", phone: "+20 107 075 6325", email: "info@mccltd-eg.com", siteUrl: "https://mccltd-eg.com" });
  assert.equal(mail.subject, "We received your message | MCC");
  for (const body of [mail.text, mail.html]) {
    assert.ok(body.includes("+20 107 075 6325"));
    assert.ok(body.includes("info@mccltd-eg.com"));
    assert.ok(body.includes("mccltd-eg.com"));
  }
  assert.ok(mail.html.includes('href="tel:+201070756325"'));
});

test("the confirmation email copes with missing company details", () => {
  const mail = leadConfirmationEmail({ companyName: "", phone: "", email: "", siteUrl: "https://mccltd-eg.com" });
  assert.equal(mail.subject, "We received your message");
  assert.ok(!mail.text.includes("reach us directly"));
  assert.ok(mail.text.includes("our team"));
});
