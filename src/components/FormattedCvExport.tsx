import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { downloadFormattedCvDocx } from "../lib/formattedCvClient";
import { isPro } from "../lib/plan";

type FormattedCvExportProps = {
  tailoredCv: string;
  slug: string;
  jobTitle?: string;
};

export function FormattedCvExport({ tailoredCv, slug, jobTitle }: FormattedCvExportProps) {
  const { profile } = useAuth();
  const pro = isPro(profile);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  if (!tailoredCv.trim()) return null;

  const handleDownload = async () => {
    setBusy(true);
    setStatus("");
    try {
      await downloadFormattedCvDocx(tailoredCv, { slug, jobTitle });
      setStatus("Downloaded");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      const e = err as Error & { code?: string };
      setStatus(e.code === "UPGRADE_REQUIRED" ? "Pro required" : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (!pro) {
    return (
      <Link
        to="/pricing"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        Formatted DOCX (Pro)
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
      >
        {busy ? "Formatting…" : "Formatted DOCX"}
      </button>
      {status && <span className="text-xs text-slate-500">{status}</span>}
    </div>
  );
}
