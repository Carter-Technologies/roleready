import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AtsReport } from "../components/AtsReport";
import { CvInput } from "../components/CvInput";
import { ExportMenu } from "../components/ExportMenu";
import { analyzeAts } from "../lib/analyzeAts";
import { generateCV } from "../lib/generateCV";
import { saveGeneration, updateMasterCv } from "../lib/history";
import { guessJobTitle, splitAIResult } from "../lib/splitResult";
import type { AtsAnalysis } from "../lib/types";

export function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [cv, setCv] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [outputCV, setOutputCV] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [masterStatus, setMasterStatus] = useState("");
  const [error, setError] = useState("");

  const busy = analyzing || generating;

  useEffect(() => {
    if (profile?.master_cv && !cv) {
      setCv(profile.master_cv);
    }
  }, [profile?.master_cv, cv]);

  const handleSaveMaster = async () => {
    if (!user || !cv.trim()) return;
    setMasterStatus("");
    try {
      await updateMasterCv(user.id, cv);
      await refreshProfile();
      setMasterStatus("Master CV saved");
    } catch (err) {
      setMasterStatus(err instanceof Error ? err.message : "Save failed");
    }
  };

  const validateInput = () => {
    if (!cv.trim() || !jobDesc.trim()) {
      setError("Please fill in both your CV and the job description.");
      return false;
    }
    setError("");
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateInput() || !user) return;

    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeAts(cv, jobDesc);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!validateInput() || !user) return;

    setGenerating(true);
    setError("");
    setOutputCV("");
    setCoverLetter("");
    setSaveStatus("");

    try {
      let currentAnalysis = analysis;
      if (!currentAnalysis) {
        currentAnalysis = await analyzeAts(cv, jobDesc);
        setAnalysis(currentAnalysis);
      }

      const result = await generateCV(cv, jobDesc);
      const split = splitAIResult(result || "");
      const jobTitle = guessJobTitle(jobDesc);

      setOutputCV(split.tailoredCV);
      setCoverLetter(split.coverLetter);

      await saveGeneration({
        userId: user.id,
        originalCv: cv,
        jobDesc,
        tailoredCv: split.tailoredCV,
        coverLetter: split.coverLetter,
        jobTitle,
        atsScore: currentAnalysis.score,
        atsAnalysis: currentAnalysis,
      });

      setSaveStatus("Saved to your history");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-olive-700">V3 — ATS intelligence</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Tailor application</h1>
        <p className="mt-2 text-slate-600">
          Analyze your fit, then generate a tailored CV and cover letter.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CvInput
            value={cv}
            onChange={setCv}
            showSaveMaster
            onSaveMaster={() => void handleSaveMaster()}
          />
          {masterStatus && <p className="mt-2 text-sm text-slate-600">{masterStatus}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-semibold text-slate-800">Job description</label>
          <textarea
            className="mt-3 h-64 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-800 shadow-sm focus:border-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-100"
            placeholder="Paste the job description here…"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleAnalyze()}
          disabled={busy}
          className="rounded-xl border border-olive-200 bg-olive-50 px-6 py-3 text-sm font-semibold text-olive-800 hover:bg-olive-100 disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "Analyze ATS fit"}
        </button>
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={busy}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {generating ? "Generating…" : "Tailor my CV"}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {saveStatus && <p className="mt-3 text-sm text-emerald-700">{saveStatus}</p>}

      {analysis && (
        <div className="mt-10 rounded-2xl border border-olive-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">ATS analysis report</h2>
          <p className="mt-1 text-sm text-slate-600">
            Keyword scoring, ATS tips, missing skills, and resume feedback.
          </p>
          <div className="mt-6">
            <AtsReport analysis={analysis} />
          </div>
        </div>
      )}

      {(outputCV || coverLetter) && (
        <div className="mt-10 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">Tailored CV</h2>
              <ExportMenu label="Tailored CV" slug="tailored-cv" text={outputCV} />
            </div>
            <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
              {outputCV}
            </pre>
          </div>

          {coverLetter && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Cover letter</h2>
                <ExportMenu label="Cover Letter" slug="cover-letter" text={coverLetter} />
              </div>
              <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                {coverLetter}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

