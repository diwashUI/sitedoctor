import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import ProCheckoutButton from "@/components/ProCheckoutButton";
import { CHECKOUT_READY } from "@/lib/config";

export const metadata: Metadata = {
  title: "Pricing — Free Scans, $29 Pro",
  description:
    "SiteDoctor scans are free forever. Pro unlocks PDF report exports for a single $29 payment — no subscription.",
};

const FAQ = [
  {
    q: "Is the free scan really the full report?",
    a: "Yes. Every scan runs all 20+ checks and shows the complete report with fix guidance. Nothing is held back.",
  },
  {
    q: "What does Pro add?",
    a: "One-click PDF export of any report — handy for sharing with a client or your team — plus priority re-scans. Pay once, yours forever.",
  },
  {
    q: "Why one-time instead of a subscription?",
    a: "A scan is a moment-in-time check, not an ongoing service bill. Pay once, export forever.",
  },
];

const FREE_FEATURES = [
  "Full 20+ point website audit",
  "Plain-words explanations + fixes",
  "Performance, SEO, accessibility scores",
  "Broken link checking",
  "Security header review",
];

const PRO_FEATURES = [
  "Everything in Free",
  "PDF export of any report",
  "Priority re-scans",
  "Pay once, yours forever",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Simple pricing
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Scans are free forever. Pro is for people who live in reports.
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-bold text-slate-900">Free</h2>
          <p className="mt-1 text-3xl font-bold text-slate-900">$0</p>
          <p className="mt-1 text-sm text-slate-500">Free forever</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/"
            className="mt-8 block rounded-full border border-slate-300 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Run a free scan
          </Link>
        </div>

        <div className="relative rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900">Pro</h2>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            $29 <span className="text-base font-normal text-slate-500">one-time</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">Pay once, yours forever</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
          {CHECKOUT_READY ? (
            <ProCheckoutButton className="mt-8 block w-full rounded-full bg-blue-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700" />
          ) : (
            <span className="mt-8 block cursor-not-allowed rounded-full bg-slate-200 py-3 text-center text-sm font-semibold text-slate-500">
              Pro checkout opening soon
            </span>
          )}
        </div>
      </div>

      <div className="mt-16">
        <Faq items={FAQ} />
      </div>
    </div>
  );
}
