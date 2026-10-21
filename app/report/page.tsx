import { Suspense } from "react";
import type { Metadata } from "next";
import ReportClient from "./ReportClient";

export const metadata: Metadata = {
  title: "Website Health Report",
  description: "Your SiteDoctor website health report: performance, SEO, accessibility, links and security scores.",
};

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" role="status" aria-label="Loading" />
          <p className="mt-6 text-lg font-semibold text-slate-900">Loading report…</p>
        </div>
      }
    >
      <ReportClient />
    </Suspense>
  );
}
