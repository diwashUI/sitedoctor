"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ScanForm from "@/components/ScanForm";
import ScoreRing from "@/components/ScoreRing";
import CategoryBar from "@/components/CategoryBar";
import IssueCard from "@/components/IssueCard";
import AdSlot from "@/components/AdSlot";
import ProCheckoutButton from "@/components/ProCheckoutButton";
import { CHECKOUT_READY } from "@/lib/config";
import { isPro } from "@/lib/pro";
import type { AnalysisReport } from "@/lib/analyze";

const LOADING_MESSAGES = [
  "Fetching your page…",
  "Reading the HTML…",
  "Checking SEO tags…",
  "Testing accessibility…",
  "Measuring performance…",
  "Checking links…",
  "Inspecting security headers…",
  "Scoring the report…",
];

type State =
  | { kind: "loading"; messageIndex: number }
  | { kind: "error"; message: string }
  | { kind: "done"; report: AnalysisReport };

function ProExportButton() {
  const [pro, setPro] = useState(false);
  useEffect(() => {
    setPro(isPro());
  }, []);

  if (!CHECKOUT_READY && !pro) {
    return (
      <span
        title="Pro coming soon"
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-500"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Export PDF — Pro
      </span>
    );
  }

  if (!pro) {
    return (
      <ProCheckoutButton className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700" />
    );
  }

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export PDF
    </button>
  );
}

export default function ReportClient() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") ?? "";
  const [state, setState] = useState<State>({ kind: "loading", messageIndex: 0 });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!url.trim()) {
      setState({ kind: "error", message: "No URL given. Go back and paste a website address." });
      return;
    }
    setState({ kind: "loading", messageIndex: 0 });
    let index = 0;
    timer.current = setInterval(() => {
      index = Math.min(index + 1, LOADING_MESSAGES.length - 1);
      setState({ kind: "loading", messageIndex: index });
    }, 2600);

    const controller = new AbortController();
    // Client-side timeout a bit above the server's budget.
    const clientTimeout = setTimeout(() => controller.abort(), 55_000);

    fetch(`/api/analyze?url=${encodeURIComponent(url)}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
        return data as AnalysisReport;
      })
      .then((report) => setState({ kind: "done", report }))
      .catch((err: Error) => {
        const message =
          err.name === "AbortError"
            ? "The scan timed out. The site may be very slow — try again."
            : err.message || "Something went wrong.";
        setState({ kind: "error", message });
      })
      .finally(() => {
        if (timer.current) clearInterval(timer.current);
        clearTimeout(clientTimeout);
      });

    return () => {
      if (timer.current) clearInterval(timer.current);
      clearTimeout(clientTimeout);
      controller.abort();
    };
  }, [url]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {state.kind === "loading" && (
        <div className="mx-auto max-w-xl py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" role="status" aria-label="Analyzing" />
          <p className="mt-6 text-lg font-semibold text-slate-900" aria-live="polite">
            {LOADING_MESSAGES[state.messageIndex]}
          </p>
          <p className="mt-2 break-all text-sm text-slate-500">{url}</p>
        </div>
      )}

      {state.kind === "error" && (
        <div className="mx-auto max-w-xl py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM12 3.75l7.5 13.5h-15L12 3.75z" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Couldn&apos;t scan that site</h1>
          <p className="mx-auto mt-2 max-w-md text-slate-600">{state.message}</p>
          <div className="mx-auto mt-8 max-w-md">
            <ScanForm initial={url} size="md" cta="Try again" />
          </div>
        </div>
      )}

      {state.kind === "done" && (
        <div className="print-area">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">SiteDoctor report</p>
              <h1 className="mt-1 break-all text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {state.report.finalUrl}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Analyzed {new Date(state.report.analyzedAt).toLocaleString()} ·{" "}
                {state.report.meta.linksChecked} links checked ·{" "}
                {(state.report.meta.htmlBytes / 1024).toFixed(0)} KB page
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 print:hidden">
              <ProExportButton />
            </div>
          </div>

          {/* Score */}
          <div className="mt-10 flex justify-center">
            <ScoreRing score={state.report.score} grade={state.report.grade} />
          </div>

          {/* Categories */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {state.report.categories.map((c) => (
              <CategoryBar
                key={c.id}
                label={c.label}
                score={c.score}
                issueCount={c.checks.filter((ch) => ch.severity !== "pass").length}
              />
            ))}
          </div>

          <AdSlot slot="report-below-score" />

          {/* Issues by category */}
          {state.report.categories.map((c) => (
            <section key={c.id} className="mt-12" aria-label={`${c.label} checks`}>
              <h2 className="text-xl font-bold text-slate-900">
                {c.label} <span className="text-slate-400">· {c.score}/100</span>
              </h2>
              <div className="mt-4 grid gap-4">
                {c.checks.map((check) => (
                  <IssueCard key={check.id} check={check} />
                ))}
              </div>
            </section>
          ))}

          {/* Scan another */}
          <section className="mx-auto mt-16 max-w-xl border-t border-slate-200 pt-10 print:hidden">
            <h2 className="text-center text-xl font-bold text-slate-900">Scan another site</h2>
            <div className="mt-4">
              <ScanForm size="md" />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
