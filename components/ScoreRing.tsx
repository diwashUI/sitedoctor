/** Big SVG score ring for the overall 0-100 score. */
export default function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;

  const color =
    score >= 90 ? "#059669" : score >= 70 ? "#2563eb" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 128 128" className="h-40 w-40 -rotate-90" role="img" aria-label={`Score ${score} out of 100`}>
          <circle cx="64" cy="64" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-slate-900">{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold" style={{ color }}>
        {grade}
      </p>
    </div>
  );
}
