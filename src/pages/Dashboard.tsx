import { useEffect, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AtsReport } from "../components/AtsReport";
import { CvInput } from "../components/CvInput";
import { ExportMenu } from "../components/ExportMenu";
import { FormattedCvExport } from "../components/FormattedCvExport";
import { PlanBanner } from "../components/PlanBanner";
import { analyzeAts } from "../lib/analyzeAts";
import { generateCV } from "../lib/generateCV";
import { syncSubscription } from "../lib/billingClient";
import { createApplicationFromGeneration } from "../lib/applications";
import { saveGeneration, updateMasterCv } from "../lib/history";
import { parseJobDescription } from "../lib/jobMeta";
import { canTailor, isPro } from "../lib/plan";
import { splitAIResult } from "../lib/splitResult";
import type { AtsAnalysis } from "../lib/types";

export function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cv, setCv] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [outputCV, setOutputCV] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [trackerLink, setTrackerLink] = useState("");
  const [masterStatus, setMasterStatus] = useState("");
  const [error, setError] = useState<ReactNode>("");

  const pro = isPro(profile);
  const allowTailor = canTailor(profile);
  const busy = analyzing || generating;

  useEffect(() => {
    if (profile?.master_cv && !cv) {
      setCv(profile.master_cv);
    }
  }, [profile?.master_cv, cv]);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      void (async () => {
        try {
          await syncSubscription();
        } catch {
          // Webhook may have already updated; refresh profile either way.
        }
        await refreshProfile();
        setSaveStatus("Welcome to Pro! Your plan is now active.");
        setSearchParams({}, { replace: true });
      })();
    }
  }, [searchParams, refreshProfile, setSearchParams]);

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
    if (!pro) return;
    if (!validateInput() || !user) return;

    setAnalyzing(true);
    setError("");
    try {
      const result = await analyzeAts(cv, jobDesc);
      setAnalysis(result);
    } catch (err) {
      const e = err as Error & { code?: string };
      setError(
        e.code === "UPGRADE_REQUIRED" ? (
          <>
            {e.message}{" "}
            <Link to="/pricing" className="font-medium underline">
              View plans
            </Link>
          </>
        ) : (
          e.message
        )
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!validateInput() || !user || !allowTailor) return;

    setGenerating(true);
    setError("");
    setOutputCV("");
    setCoverLetter("");
    setSaveStatus("");
    setTrackerLink("");
    setAnalysis(null);

    try {
      const result = await generateCV(cv, jobDesc);
      const split = splitAIResult(result || "");
      const jobMeta = parseJobDescription(jobDesc);

      setOutputCV(split.tailoredCV);
      setCoverLetter(split.coverLetter);
      setJobTitle(jobMeta.displayTitle);

      const saved = await saveGeneration({
        userId: user.id,
        originalCv: cv,
        jobDesc,
        tailoredCv: split.tailoredCV,
        coverLetter: split.coverLetter,
        jobTitle: jobMeta.displayTitle,
        atsScore: null,
        atsAnalysis: null,
      });

      if (saved && pro) {
        const app = await createApplicationFromGeneration({
          userId: user.id,
          company: jobMeta.company || "Company",
          roleTitle: jobMeta.roleTitle || jobMeta.displayTitle,
          cvRequestId: saved.id,
          status: "applied",
        });
        setTrackerLink(app.id);
        setSaveStatus("Saved to history and job tracker");
      } else if (saved) {
        setSaveStatus("Saved to your history");
      }

      await refreshProfile();
    } catch (err) {
      const e = err as Error & { code?: string };
      if (e.code === "UPGRADE_REQUIRED") {
        setError(
          <>
            {e.message}{" "}
            <Link to="/pricing" className="font-medium underline">
              Upgrade to Pro
            </Link>
          </>
        );
      } else {
        setError(e.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tailor application</h1>
        <p className="mt-2 text-slate-600">
          {pro
            ? "Generate tailored CVs, run ATS analysis, and track every application."
            : "Your free plan includes one tailored CV per month, saved in History."}
        </p>
      </div>

      <PlanBanner className="mb-6" />

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
        {pro ? (
          <button
            type="button"
            onClick={() => void handleAnalyze()}
            disabled={busy}
            className="rounded-xl border border-olive-200 bg-olive-50 px-6 py-3 text-sm font-semibold text-olive-800 hover:bg-olive-100 disabled:opacity-50"
          >
            {analyzing ? "Analyzing…" : "Analyze ATS fit"}
          </button>
        ) : (
          <Link
            to="/pricing"
            className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-500"
          >
            ATS analysis (Pro)
          </Link>
        )}
        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={busy || !allowTailor}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {generating ? "Generating…" : "Tailor my CV"}
        </button>
        {!allowTailor && (
          <Link
            to="/pricing"
            className="self-center text-sm font-medium text-olive-700 hover:underline"
          >
            Upgrade for more generations
          </Link>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {saveStatus && (
        <p className="mt-3 text-sm text-emerald-700">
          {saveStatus}
          {trackerLink && pro && (
            <>
              {" "}
              <Link to="/tracker" className="font-medium text-olive-800 underline">
                View in tracker
              </Link>
            </>
          )}
          {!pro && (
            <>
              {" "}
              <Link to="/history" className="font-medium text-olive-800 underline">
                View in history
              </Link>
            </>
          )}
        </p>
      )}

      {analysis && pro && (
        <div className="mt-10 rounded-2xl border border-olive-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">ATS analysis report</h2>
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
              <div className="flex flex-wrap items-center gap-2">
                <ExportMenu label="Tailored CV" slug="tailored-cv" text={outputCV} />
                <FormattedCvExport
                  tailoredCv={outputCV}
                  slug="tailored-cv"
                  jobTitle={jobTitle}
                />
              </div>
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
