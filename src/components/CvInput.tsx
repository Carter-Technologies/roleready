import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { parseCvFile } from "../lib/parsePdf";

type CvInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSaveMaster?: () => void;
  showSaveMaster?: boolean;
};

export function CvInput({ value, onChange, onSaveMaster, showSaveMaster }: CvInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setParseError("");
    setParsing(true);
    try {
      const text = await parseCvFile(file);
      onChange(text);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse file");
    } finally {
      setParsing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-800">Your CV</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={parsing}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {parsing ? "Parsing…" : "Upload PDF / TXT"}
          </button>
          {showSaveMaster && onSaveMaster && (
            <button
              type="button"
              onClick={onSaveMaster}
              className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 hover:bg-violet-100"
            >
              Save as master CV
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {parseError && (
        <p className="text-sm text-red-600" role="alert">
          {parseError}
        </p>
      )}

      <textarea
        className="h-64 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm leading-relaxed text-slate-800 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        placeholder="Paste your CV here, or upload a PDF…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
