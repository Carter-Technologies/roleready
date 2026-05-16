import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CvInput } from "../components/CvInput";
import { ExportMenu } from "../components/ExportMenu";
import { generateCV } from "../lib/generateCV";
import { saveGeneration, updateMasterCv } from "../lib/history";
import { guessJobTitle, splitAIResult } from "../lib/splitResult";

export function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [cv, setCv] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputCV, setOutputCV] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [masterStatus, setMasterStatus] = useState("");

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
    } catch (error) {
      setMasterStatus(error instanceof Error ? error.message : "Save failed");
    }
  };

  const handleGenerate = async () => {
    if (!cv.trim() || !jobDesc.trim()) {
      alert("Please fill in both fields");
      return;
    }

    if (!user) return;

    setLoading(true);
    setOutputCV("");
    setCoverLetter("");
    setSaveStatus("");

    try {
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
      });

      setSaveStatus("Saved to your history");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tailor application</h1>
        <p className="mt-2 text-slate-600">
          Upload or paste your CV, add a job description, and generate a tailored pack.
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
          {masterStatus && (
            <p className="mt-2 text-sm text-slate-600">{masterStatus}</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="text-sm font-semibold text-slate-800">Job description</label>
          <textarea
            className="mt-3 h-64 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-800 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Paste the job description here…"
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => void handleGenerate()}
        disabled={loading}
        className="mt-6 rounded-xl bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Tailor my CV"}
      </button>

      {saveStatus && <p className="mt-3 text-sm text-emerald-700">{saveStatus}</p>}

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
