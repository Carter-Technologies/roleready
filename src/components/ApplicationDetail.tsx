import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { InterviewPrepPanel } from "./InterviewPrepPanel";
import { updateApplication } from "../lib/applications";
import { fetchFollowUpDraft } from "../lib/followUp";
import { fetchGenerations } from "../lib/history";
import { fetchInterviewPrep } from "../lib/interviewPrep";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus,
} from "../lib/applicationStatus";
import type { FollowUpDraft, Generation, InterviewPrep, JobApplication } from "../lib/types";

type ApplicationDetailProps = {
  application: JobApplication;
  userId: string;
  onClose: () => void;
  onUpdated: (app: JobApplication) => void;
};

export function ApplicationDetail({
  application,
  userId,
  onClose,
  onUpdated,
}: ApplicationDetailProps) {
  const [app, setApp] = useState(application);
  const [linkedGen, setLinkedGen] = useState<Generation | null>(null);
  const [prep, setPrep] = useState<InterviewPrep | null>(
    (application.interview_prep as InterviewPrep | null) ?? null
  );
  const [followUp, setFollowUp] = useState<FollowUpDraft | null>(() => {
    if (!application.follow_up_draft) return null;
    try {
      return JSON.parse(application.follow_up_draft) as FollowUpDraft;
    } catch {
      return null;
    }
  });
  const [loadingPrep, setLoadingPrep] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setApp(application);
    setPrep((application.interview_prep as InterviewPrep | null) ?? null);
  }, [application]);

  useEffect(() => {
    if (!app.primary_cv_request_id) return;
    void fetchGenerations(userId).then((gens) => {
      setLinkedGen(gens.find((g) => g.id === app.primary_cv_request_id) ?? null);
    });
  }, [app.primary_cv_request_id, userId]);

  const getLinkedGeneration = async (): Promise<Generation | null> => {
    if (linkedGen) return linkedGen;
    if (!app.primary_cv_request_id) return null;
    const gens = await fetchGenerations(userId);
    const found = gens.find((g) => g.id === app.primary_cv_request_id) ?? null;
    setLinkedGen(found);
    return found;
  };

  const handleStatusChange = async (status: ApplicationStatus) => {
    setSaving(true);
    setError("");
    try {
      const patch: Parameters<typeof updateApplication>[1] = { status };
      if (status === "applied" && !app.applied_at) {
        patch.applied_at = new Date().toISOString();
      }
      const updated = await updateApplication(app.id, patch);
      setApp(updated);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async (notes: string) => {
    const updated = await updateApplication(app.id, { notes });
    setApp(updated);
    onUpdated(updated);
  };

  const handleInterviewPrep = async () => {
    const gen = await getLinkedGeneration();
    if (!gen) {
      setError("Link a tailored CV from History to generate interview prep.");
      return;
    }

    setLoadingPrep(true);
    setError("");
    try {
      const result = await fetchInterviewPrep(gen.original_cv, gen.job_description, app.company);
      setPrep(result);
      const updated = await updateApplication(app.id, { interview_prep: result });
      setApp(updated);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Interview prep failed");
    } finally {
      setLoadingPrep(false);
    }
  };

  const handleFollowUp = async () => {
    const gen = await getLinkedGeneration();
    setLoadingFollowUp(true);
    setError("");
    try {
      const draft = await fetchFollowUpDraft({
        cv: gen?.original_cv ?? "",
        jobDesc: gen?.job_description ?? "",
        company: app.company,
        roleTitle: app.role_title,
        notes: app.notes ?? "",
      });
      setFollowUp(draft);
      const updated = await updateApplication(app.id, {
        follow_up_draft: JSON.stringify(draft),
      });
      setApp(updated);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up draft failed");
    } finally {
      setLoadingFollowUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 p-4 sm:p-6">
      <div className="flex h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{app.role_title}</h2>
            <p className="text-sm text-slate-600">{app.company}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 p-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </label>
            <select
              value={app.status}
              disabled={saving}
              onChange={(e) => void handleStatusChange(e.target.value as ApplicationStatus)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {app.job_url && (
            <p>
              <a
                href={app.job_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-olive-700 hover:underline"
              >
                View job posting
              </a>
            </p>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </label>
            <textarea
              defaultValue={app.notes ?? ""}
              onBlur={(e) => void handleSaveNotes(e.target.value)}
              className="mt-2 h-24 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm"
              placeholder="Recruiter name, referral, next steps…"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loadingPrep}
              onClick={() => void handleInterviewPrep()}
              className="rounded-lg border border-olive-200 bg-olive-50 px-4 py-2 text-sm font-medium text-olive-800 hover:bg-olive-100 disabled:opacity-50"
            >
              {loadingPrep ? "Preparing…" : "Interview prep"}
            </button>
            <button
              type="button"
              disabled={loadingFollowUp}
              onClick={() => void handleFollowUp()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {loadingFollowUp ? "Drafting…" : "Draft follow-up"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {prep && (
            <div>
              <h3 className="mb-3 font-semibold text-slate-900">Interview prep</h3>
              <InterviewPrepPanel prep={prep} />
            </div>
          )}

          {followUp && (
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-900">Follow-up email draft</h3>
              <p className="mt-2 text-sm font-medium text-slate-700">Subject: {followUp.subject}</p>
              <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{followUp.body}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
