import { useState } from "react";
import {
  copyToClipboard,
  downloadDocx,
  downloadPdf,
  downloadTextFile,
} from "../lib/exports";

type ExportMenuProps = {
  label: string;
  slug: string;
  text: string;
};

export function ExportMenu({ label, slug, text }: ExportMenuProps) {
  const [status, setStatus] = useState("");

  const run = async (action: () => void | Promise<void>) => {
    try {
      await action();
      setStatus("Done");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error(error);
      setStatus("Failed");
    }
  };

  const base = `roleready-${slug}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void run(() => copyToClipboard(text))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        Copy
      </button>
      <button
        type="button"
        onClick={() => void run(() => downloadTextFile(`${base}.txt`, text))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        TXT
      </button>
      <button
        type="button"
        onClick={() => void run(() => downloadPdf(`${base}.pdf`, label, text))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        PDF
      </button>
      <button
        type="button"
        onClick={() => void run(() => downloadDocx(`${base}.docx`, label, text))}
        className="rounded-lg bg-olive-600 px-3 py-2 text-sm font-medium text-white hover:bg-olive-700"
      >
        DOCX
      </button>
      {status && <span className="text-xs text-slate-500">{status}</span>}
    </div>
  );
}
