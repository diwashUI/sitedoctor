import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — SiteDoctor",
  description: "SiteDoctor's refund policy for the $29 one-time Pro purchase.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Refund Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: October 21, 2026</p>

      <Section title="14-day refunds">
        <p>
          SiteDoctor Pro is a one-time payment of $29 USD. If Pro doesn&apos;t work
          as described — for example, PDF export isn&apos;t unlocked after a
          successful purchase — you can request a full refund within 14 days of
          purchase. The free scans are, of course, free.
        </p>
      </Section>

      <Section title="How to request a refund">
        <p>
          Email{" "}
          <a href="mailto:itsaurevya@gmail.com" className="text-blue-600 underline hover:text-blue-700">
            itsaurevya@gmail.com
          </a>{" "}
          with the email address you used at checkout (or your Paddle receipt), and a
          short note about what went wrong. We&apos;ll confirm and process it.
        </p>
      </Section>

      <Section title="How refunds are paid">
        <p>
          Refunds are issued through Paddle, our payment processor, back to your
          original payment method. Depending on your bank, it can take 5–10 business
          days to appear.
        </p>
      </Section>
    </div>
  );
}
