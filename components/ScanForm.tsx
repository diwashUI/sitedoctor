"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Shared URL scan input. Used in the hero and on the report page. */
export default function ScanForm({
  initial = "",
  size = "lg",
  cta = "Analyze my site",
}: {
  initial?: string;
  size?: "lg" | "md";
  cta?: string;
}) {
  const [value, setValue] = useState(initial);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = value.trim();
    if (!url) return;
    router.push(`/report?url=${encodeURIComponent(url)}`);
  };

  const inputCls =
    size === "lg"
      ? "h-14 rounded-2xl px-5 text-base"
      : "h-12 rounded-xl px-4 text-sm";

  return (
    <form onSubmit={submit} className="w-full" role="search" aria-label="Scan a website">
      <div
        className={`flex w-full flex-col gap-2 sm:flex-row ${size === "lg" ? "sm:gap-3" : "sm:gap-2"}`}
      >
        <input
          type="text"
          inputMode="url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="yourwebsite.com"
          aria-label="Website URL to analyze"
          className={`${inputCls} w-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500`}
        />
        <button
          type="submit"
          className={`shrink-0 rounded-2xl bg-blue-600 font-semibold text-white transition hover:bg-blue-700 ${
            size === "lg" ? "h-14 px-8 text-base" : "h-12 px-6 text-sm"
          }`}
        >
          {cta}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Free scan. We fetch your homepage once and analyze it — nothing is stored.
      </p>
    </form>
  );
}
