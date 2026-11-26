import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { getSettings } from "@/lib/db/queries";

// Change this date whenever the policy below changes.
const UPDATED = "26 November 2026";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How we use the details you send us through this website, and your rights over them.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  const company = settings.companyName;
  const email = settings.email;
  const contact = email ? (
    <a href={`mailto:${email}`} className="font-semibold underline underline-offset-4">{email}</a>
  ) : (
    <Link href="/contact" className="font-semibold underline underline-offset-4">our contact page</Link>
  );

  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "Who we are",
      body: (
        <p>
          This website is run by {company}
          {settings.address ? `, ${settings.address}` : ""}. {company} decides how the details you send through it are
          used. For anything about your data, write to {contact}.
        </p>
      ),
    },
    {
      title: "What we collect",
      body: (
        <>
          <p>When you send the contact form we receive:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>your name, and the phone number and/or email address you give us;</li>
            <li>the service you&apos;re asking about and your message, if you write one;</li>
            <li>the page you sent the form from, and the date and time.</li>
          </ul>
          <p className="mt-4">
            We don&apos;t ask for anything else, and you don&apos;t need an account to use the site.
          </p>
        </>
      ),
    },
    {
      title: "Why we use it",
      body: (
        <p>
          Only to reply to your enquiry and, if it leads to work together, to follow it up. By sending the form you agree
          to us using your details this way. We don&apos;t sell them, use them for advertising, or add you to a mailing
          list.
        </p>
      ),
    },
    {
      title: "Who else handles it",
      body: (
        <>
          <p>Our staff, and these services that run the website for us:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-6">
            <li>
              <strong>Cloudflare</strong> hosts the site and stores enquiries. Its Turnstile check looks at your browser
              when you send the form, to stop spam. Its Web Analytics counts visits without cookies and without
              identifying you.
            </li>
            <li>
              <strong>Resend</strong> delivers the email that tells our team a new enquiry has arrived.
            </li>
          </ul>
          <p className="mt-4">These services may process data outside Egypt, under their own data protection terms.</p>
        </>
      ),
    },
    {
      title: "How long we keep it",
      body: (
        <p>
          We keep an enquiry for as long as we need it to answer you and follow up on any project that comes of it, then
          delete it. Copies in our backups are removed automatically within 90 days after that.
        </p>
      ),
    },
    {
      title: "Your rights",
      body: (
        <p>
          Under Egypt&apos;s Personal Data Protection Law (No. 151 of 2020) you can ask us what we hold about you, to
          correct it, or to delete it, and you can withdraw your consent at any time. Write to {contact} and we&apos;ll
          answer as soon as we can.
        </p>
      ),
    },
    {
      title: "Cookies",
      body: (
        <p>
          The public website doesn&apos;t use advertising or tracking cookies. Our staff&apos;s sign-in to the admin area
          uses a cookie that only they receive.
        </p>
      ),
    },
    {
      title: "Changes",
      body: <p>If we change this policy, we&apos;ll update it here and change the date at the top.</p>,
    },
  ];

  return (
    <section className="section-y">
      <div className="container-x">
        <Reveal className="max-w-3xl">
          <h1 className="text-display font-semibold">Privacy policy</h1>
          <p className="mt-4 text-muted">Last updated {UPDATED}</p>
          <div className="mt-12 grid gap-10">
            {sections.map((s) => (
              <div key={s.title}>
                <h2 className="text-[clamp(1.375rem,1.1rem+0.8vw,1.75rem)] leading-tight font-semibold tracking-tight">{s.title}</h2>
                <div className="mt-4">{s.body}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
