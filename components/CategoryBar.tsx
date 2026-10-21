/** Per-category score bar. */
export default function CategoryBar({
  label,
  score,
  issueCount,
}: {
  label: string;
  score: number;
  issueCount: number;
}) {
  const color =
    score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-blue-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
        <span className="text-2xl font-bold text-slate-900">{score}</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {issueCount === 0
          ? "No issues found"
          : `${issueCount} issue${issueCount === 1 ? "" : "s"} to fix`}
      </p>
    </div>
  );
}
