import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AtsReport } from "../components/AtsReport";
import { ExportMenu } from "../components/ExportMenu";
import type { AtsAnalysis } from "../lib/types";
import {
  createApplicationFromGeneration,
  fetchApplications,
  linkGenerationToApplication,
} from "../lib/applications";
import { deleteGeneration, fetchGenerations } from "../lib/history";
import type { Generation, JobApplication } from "../lib/types";

export function History() {
  const { user } = useAuth();
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackerApps, setTrackerApps] = useState<JobApplication[]>([]);
  const [linkTargetByGen, setLinkTargetByGen] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const [data, apps] = await Promise.all([
        fetchGenerations(user.id),
        fetchApplications(user.id),
      ]);
      setItems(data);
      setTrackerApps(apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLinkToExisting = async (item: Generation) => {
    const appId = linkTargetByGen[item.id];
    if (!appId) {
      alert("Choose a tracker card to link this CV to.");
      return;
    }
    try {
      await linkGenerationToApplication(appId, item.id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link to tracker");
    }
  };

  const handleAddToTracker = async (item: Generation) => {
    if (!user || item.application_id) return;
    const company = item.job_title?.split(" at ")?.[1] ?? "Company";
    const role = item.job_title?.split(" at ")?.[0] ?? item.job_title ?? "Role";
    try {
      await createApplicationFromGeneration({
        userId: user.id,
        company,
        roleTitle: role,
        cvRequestId: item.id,
        status: "applied",
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add to tracker");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application from history?")) return;
    try {
      await deleteGeneration(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Application history</h1>
          <p className="mt-2 text-slate-600">All your tailored CVs and cover letters in one place.</p>
        </div>
        <Link
          to="/app"
          className="rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700"
        >
          New application
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading history…</p>}
      {error && (
        <p className="text-red-600" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-slate-600">No applications yet.</p>
          <Link to="/app" className="mt-4 inline-block text-olive-700 font-medium hover:underline">
            Tailor your first CV →
          </Link>
        </div>
      )}

      <ul className="space-y-4">
        {items.map((item) => {
          const open = expandedId === item.id;
          return (
            <li
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 p-5 text-left hover:bg-slate-50"
                onClick={() => setExpandedId(open ? null : item.id)}
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.job_title || "Untitled role"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(item.created_at)}</p>
                  {item.ats_score != null && (
                    <p className="mt-2 text-sm font-medium text-olive-700">
                      ATS score: {item.ats_score}/100
                    </p>
                  )}
                </div>
                <span className="text-sm text-olive-700">{open ? "Hide" : "View"}</span>
              </button>

              {open && (
                <div className="border-t border-slate-100 p-5 space-y-6">
                  {item.ats_analysis && (
                    <div>
                      <h3 className="mb-3 font-medium text-slate-800">ATS analysis</h3>
                      <AtsReport analysis={item.ats_analysis as AtsAnalysis} />
                    </div>
                  )}
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium text-slate-800">Tailored CV</h3>
                      <ExportMenu
                        label="Tailored CV"
                        slug={`cv-${item.id.slice(0, 8)}`}
                        text={item.tailored_cv || ""}
                      />
                    </div>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      {item.tailored_cv}
                    </pre>
                  </div>

                  {item.cover_letter && (
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-medium text-slate-800">Cover letter</h3>
                        <ExportMenu
                          label="Cover Letter"
                          slug={`cl-${item.id.slice(0, 8)}`}
                          text={item.cover_letter}
                        />
                      </div>
                      <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                        {item.cover_letter}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    {!item.application_id && trackerApps.length > 0 && (
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-[200px] flex-1">
                          <label className="text-xs font-medium text-slate-500">
                            Link to existing tracker card
                          </label>
                          <select
                            value={linkTargetByGen[item.id] ?? ""}
                            onChange={(e) =>
                              setLinkTargetByGen((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          >
                            <option value="">Select card…</option>
                            {trackerApps.map((app) => (
                              <option key={app.id} value={app.id}>
                                {app.company} — {app.role_title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleLinkToExisting(item)}
                          className="rounded-lg border border-olive-200 bg-olive-50 px-3 py-2 text-sm font-medium text-olive-800 hover:bg-olive-100"
                        >
                          Link to card
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {!item.application_id && (
                        <button
                          type="button"
                          onClick={() => void handleAddToTracker(item)}
                          className="text-sm font-medium text-olive-700 hover:text-olive-800"
                        >
                          Create new tracker card
                        </button>
                      )}
                      {item.application_id && (
                        <Link
                          to="/tracker"
                          className="text-sm font-medium text-olive-700 hover:underline"
                        >
                          View in tracker
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
