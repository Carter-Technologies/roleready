import type { InterviewPrep } from "../lib/types";

type InterviewPrepPanelProps = {
  prep: InterviewPrep;
};

export function InterviewPrepPanel({ prep }: InterviewPrepPanelProps) {
  return (
    <div className="space-y-6 text-sm">
      {prep.elevatorPitch && (
        <section>
          <h4 className="font-semibold text-slate-800">Elevator pitch</h4>
          <p className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-700">{prep.elevatorPitch}</p>
        </section>
      )}

      <section>
        <h4 className="font-semibold text-slate-800">Likely questions</h4>
        <ul className="mt-3 space-y-3">
          {prep.questions.map((q, i) => (
            <li key={i} className="rounded-xl border border-slate-100 p-4">
              <p className="font-medium text-slate-900">{q.question}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-olive-700">{q.category}</p>
              {q.tips && <p className="mt-2 text-slate-600">{q.tips}</p>}
            </li>
          ))}
        </ul>
      </section>

      {prep.starAnswers.length > 0 && (
        <section>
          <h4 className="font-semibold text-slate-800">STAR story outlines</h4>
          <ul className="mt-3 space-y-4">
            {prep.starAnswers.map((s, i) => (
              <li key={i} className="rounded-xl bg-olive-50/50 p-4">
                <p className="font-medium text-slate-900">{s.question}</p>
                <dl className="mt-2 grid gap-1 text-slate-600">
                  <div>
                    <dt className="inline font-medium">Situation: </dt>
                    <dd className="inline">{s.situation}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Task: </dt>
                    <dd className="inline">{s.task}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Action: </dt>
                    <dd className="inline">{s.action}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Result: </dt>
                    <dd className="inline">{s.result}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      )}

      {prep.questionsToAsk.length > 0 && (
        <section>
          <h4 className="font-semibold text-slate-800">Questions to ask them</h4>
          <ul className="mt-2 list-inside list-disc space-y-1 text-slate-700">
            {prep.questionsToAsk.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      {prep.focusAreas.length > 0 && (
        <section>
          <h4 className="font-semibold text-slate-800">Focus areas</h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {prep.focusAreas.map((area) => (
              <li
                key={area}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
