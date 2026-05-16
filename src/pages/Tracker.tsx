import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ApplicationDetail } from "../components/ApplicationDetail";
import {
  createApplication,
  deleteApplication,
  fetchApplications,
  updateApplication,
} from "../lib/applications";
import {
  KANBAN_COLUMNS,
  STATUS_LABELS,
  type ApplicationStatus,
} from "../lib/applicationStatus";
import type { JobApplication } from "../lib/types";

export function Tracker() {
  const { user } = useAuth();
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formUrl, setFormUrl] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      setApps(await fetchApplications(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const appsByStatus = (status: ApplicationStatus) =>
    apps.filter((a) => a.status === status);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formCompany.trim() || !formRole.trim()) return;
    try {
      const app = await createApplication({
        userId: user.id,
        company: formCompany.trim(),
        roleTitle: formRole.trim(),
        jobUrl: formUrl.trim() || undefined,
        status: "wishlist",
      });
      setApps((prev) => [app, ...prev]);
      setShowForm(false);
      setFormCompany("");
      setFormRole("");
      setFormUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    }
  };

  const moveToColumn = async (app: JobApplication, status: ApplicationStatus) => {
    try {
      const patch: Parameters<typeof updateApplication>[1] = { status };
      if (status === "applied" && !app.applied_at) {
        patch.applied_at = new Date().toISOString();
      }
      const updated = await updateApplication(app.id, patch);
      setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (selected?.id === updated.id) setSelected(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application from your tracker?")) return;
    try {
      await deleteApplication(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-olive-700">V4 — Job tracker</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Applications</h1>
          <p className="mt-2 text-slate-600">
            Track every role from wishlist to offer. Open a card for interview prep and follow-ups.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700"
        >
          <Plus className="h-4 w-4" />
          Add application
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">No applications yet.</p>
          <Link to="/app" className="mt-4 inline-block font-medium text-olive-700 hover:underline">
            Tailor a CV first
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((status) => (
            <div
              key={status}
              className="min-w-[240px] flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
            >
              <h2 className="mb-3 px-1 text-sm font-semibold text-slate-700">
                {STATUS_LABELS[status]}
                <span className="ml-2 text-slate-400">({appsByStatus(status).length})</span>
              </h2>
              <ul className="space-y-2">
                {appsByStatus(status).map((app) => (
                  <li key={app.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(app)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-olive-300 hover:shadow"
                    >
                      <p className="font-semibold text-slate-900">{app.company}</p>
                      <p className="mt-1 text-sm text-slate-600">{app.role_title}</p>
                      {app.interview_prep && (
                        <p className="mt-2 text-xs font-medium text-olive-700">Prep ready</p>
                      )}
                    </button>
                    <div className="mt-1 flex flex-wrap gap-1 px-1">
                      {KANBAN_COLUMNS.filter((s) => s !== status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => void moveToColumn(app, s)}
                          className="text-xs text-slate-500 hover:text-olive-700"
                        >
                          → {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {(apps.some((a) => a.status === "rejected" || a.status === "withdrawn") ||
        apps.length > 0) && (
        <details className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Closed ({apps.filter((a) => a.status === "rejected" || a.status === "withdrawn").length})
          </summary>
          <ul className="mt-3 space-y-2">
            {apps
              .filter((a) => a.status === "rejected" || a.status === "withdrawn")
              .map((app) => (
                <li
                  key={app.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(app)}
                    className="text-left hover:text-olive-700"
                  >
                    {app.company} — {app.role_title} ({STATUS_LABELS[app.status as ApplicationStatus]})
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(app.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        </details>
      )}

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <form
            onSubmit={(e) => void handleCreate(e)}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">New application</h2>
            <label className="mt-4 block text-sm font-medium text-slate-700">Company</label>
            <input
              required
              value={formCompany}
              onChange={(e) => setFormCompany(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Role</label>
            <input
              required
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Job URL (optional)</label>
            <input
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-olive-600 py-2 text-sm font-semibold text-white hover:bg-olive-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && user && (
        <ApplicationDetail
          application={selected}
          userId={user.id}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}
