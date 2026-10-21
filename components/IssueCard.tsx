import type { CheckResult } from "@/lib/analyze";

const SEVERITY_STYLE = {
  pass: {
    ring: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    label: "Pass",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    ),
  },
  warn: {
    ring: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    label: "Warning",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM12 3.75l7.5 13.5h-15L12 3.75z" />
    ),
  },
  fail: {
    ring: "border-red-200",
    badge: "bg-red-100 text-red-700",
    label: "Needs fix",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    ),
  },
} as const;

/** One check result: severity badge, plain-words explanation, fix guidance. */
export default function IssueCard({ check }: { check: CheckResult }) {
  const style = SEVERITY_STYLE[check.severity];
  return (
    <div className={`rounded-2xl border bg-white p-6 ${style.ring}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${style.badge}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
            {style.icon}
          </svg>
        </span>
        <h3 className="text-base font-bold text-slate-900">{check.title}</h3>
        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{check.summary}</p>
      {check.severity !== "pass" && (
        <div className="mt-3 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">How to fix</p>
          <p className="mt-1 text-sm text-slate-700">{check.fix}</p>
        </div>
      )}
      {check.details && check.details.length > 0 && (
        <ul className="mt-3 space-y-1">
          {check.details.map((d, i) => (
            <li key={i} className="truncate font-mono text-xs text-slate-500" title={d}>
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
