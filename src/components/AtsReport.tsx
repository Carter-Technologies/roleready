import type { AtsAnalysis } from "../lib/types";

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

type AtsReportProps = {
  analysis: AtsAnalysis;
};

export function AtsReport({ analysis }: AtsReportProps) {
  const { keywordScoring } = analysis;

  return (
    <div className="space-y-6">
      <div
        className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 ${scoreColor(analysis.score)}`}
      >
        <span className="text-3xl font-bold">{analysis.score}</span>
        <div className="text-left text-sm">
          <p className="font-semibold">Overall ATS fit</p>
          <p>Keyword match: {keywordScoring.matchPercentage}%</p>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Keyword scoring
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-emerald-50/80 p-4">
            <p className="text-sm font-medium text-emerald-900">
              Matched ({keywordScoring.matchedKeywords.length})
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {keywordScoring.matchedKeywords.length === 0 ? (
                <li className="text-sm text-slate-600">None detected</li>
              ) : (
                keywordScoring.matchedKeywords.map((kw) => (
                  <li
                    key={kw}
                    className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                  >
                    {kw}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-xl bg-red-50/80 p-4">
            <p className="text-sm font-medium text-red-900">
              Missing ({keywordScoring.missingKeywords.length})
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {keywordScoring.missingKeywords.length === 0 ? (
                <li className="text-sm text-slate-600">None — strong keyword overlap</li>
              ) : (
                keywordScoring.missingKeywords.map((kw) => (
                  <li
                    key={kw}
                    className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
                  >
                    {kw}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          ATS optimisation
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {analysis.atsOptimisation.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Missing skills analysis
        </h3>
        <ul className="mt-3 space-y-3">
          {analysis.missingSkills.map((item) => (
            <li
              key={item.skill}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{item.skill}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.importance === "high"
                      ? "bg-red-100 text-red-800"
                      : item.importance === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.importance}
                </span>
              </div>
              {item.suggestion && (
                <p className="mt-2 text-slate-600">{item.suggestion}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Resume feedback
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {analysis.resumeFeedback.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

