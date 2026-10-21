import Link from "next/link";
import ScanForm from "@/components/ScanForm";
import AdSlot from "@/components/AdSlot";
import Faq from "@/components/Faq";
import { CHECKOUT_READY } from "@/lib/config";

const SAMPLE_URL = "https://example.com";

const HOW_IT_WORKS = [
  {
    title: "Paste your URL",
    text: "Type any website address. We fetch the page once, the same way a visitor's browser would.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    ),
  },
  {
    title: "We run 20+ checks",
    text: "Speed, SEO, accessibility, broken links and security headers — each one scored and explained.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: "Get plain-words fixes",
    text: "Every issue comes with what it means and exactly how to fix it — no jargon, no guesswork.",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    ),
  },
];

const FAQ = [
  {
    q: "Is the scan really free?",
    a: "Yes. Every scan runs the full set of checks and shows the complete report. Pro adds PDF export of reports and priority re-scans.",
  },
  {
    q: "Do you store my website's data?",
    a: "No. We fetch your page once, analyze it, and return the report. Nothing is saved or shared.",
  },
  {
    q: "What does the score mean?",
    a: "A 0–100 score across five categories: performance, SEO, accessibility, links and security. 90+ is excellent, 70+ is good, below 50 needs work.",
  },
  {
    q: "My site needs login — can you scan it?",
    a: "Not yet. SiteDoctor analyzes publicly accessible pages, the same ones Google and your visitors see.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:pt-28">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Website health auditor
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          How healthy is your website, really?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Paste your URL. Get a full report card — speed, SEO, accessibility, broken
          links, security — with every issue explained in plain words.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <ScanForm />
        </div>
      </section>

      <AdSlot slot="landing-below-hero" />

      {/* How it works */}
      <section id="how" className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.title} className="rounded-3xl border border-slate-200 bg-white p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                    {s.icon}
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section id="sample" className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          See what a report looks like
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Run a live scan of a sample page right now — no sign-up, the full report,
          exactly what you&apos;d get for your own site.
        </p>
        <div className="mx-auto mt-8 max-w-xl">
          <ScanForm initial={SAMPLE_URL} size="md" cta="Run sample scan" />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Free scans, forever
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Every scan is free and complete.{" "}
            {CHECKOUT_READY ? (
              <>SiteDoctor Pro adds PDF exports and priority re-scans for a single $29 payment.</>
            ) : (
              <>A Pro tier with PDF report exports is on the way.</>
            )}
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <Faq items={FAQ} />
      </section>
    </div>
  );
}
