import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SiteDoctor",
  description: "SiteDoctor's privacy policy: scans are fetched once, analyzed, and never stored.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: October 21, 2026</p>

      <Section title="The short version">
        <p>
          When you scan a website, we fetch that page once, analyze it, and show you
          the report. We don&apos;t store the page, the report, or your scan history.
          We have no user accounts and run no third-party analytics trackers.
        </p>
      </Section>

      <Section title="What we don't collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>Scanned pages or reports — analysis happens per request and is discarded.</li>
          <li>Account information — there are no accounts to create.</li>
          <li>Analytics or tracking data — we run no third-party trackers on this site.</li>
        </ul>
      </Section>

      <Section title="What is stored on your device">
        <p>
          If you purchase SiteDoctor Pro, a small flag is saved in your browser&apos;s
          local storage so the site remembers your Pro status on that device. It never
          leaves your browser, and clearing your site data removes it (your Paddle
          receipt email remains your proof of purchase).
        </p>
      </Section>

      <Section title="Payments">
        <p>
          Payments are processed by Paddle, our merchant of record. When you buy Pro,
          Paddle collects your name, email address, and payment details under its own{" "}
          <a href="https://www.paddle.com/legal/privacy" className="text-blue-600 underline hover:text-blue-700">
            privacy policy
          </a>
          . We receive only a confirmation that the transaction completed — never your
          card details.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about privacy? Email{" "}
          <a href="mailto:itsaurevya@gmail.com" className="text-blue-600 underline hover:text-blue-700">
            itsaurevya@gmail.com
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
