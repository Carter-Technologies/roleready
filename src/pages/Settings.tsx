import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { deleteAccount } from "../lib/accountClient";
import { openBillingPortal } from "../lib/billingClient";
import { isPro } from "../lib/plan";
import { LEGAL_EMAIL } from "../lib/legalMeta";
import { usePageTitle } from "../hooks/usePageTitle";

export function Settings() {
  usePageTitle("Account settings");

  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const pro = isPro(profile);

  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmText === "DELETE";

  const handlePortal = async () => {
    setPortalBusy(true);
    setError("");
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setPortalBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    if (
      !confirm(
        "This permanently deletes your Kigho account and all saved CVs, applications, and tracker data. This cannot be undone. Continue?"
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      await deleteAccount();
      await signOut();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account deletion failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-12 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Account settings</h1>
      <p className="mt-2 text-slate-600">Manage your Kigho account, billing, and data.</p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-10 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
            <dt className="shrink-0 font-medium text-slate-500">Email</dt>
            <dd className="break-all text-slate-800">{user?.email ?? profile?.email ?? "—"}</dd>
          </div>
          {profile?.full_name && (
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
              <dt className="shrink-0 font-medium text-slate-500">Name</dt>
              <dd className="text-slate-800">{profile.full_name}</dd>
            </div>
          )}
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
            <dt className="shrink-0 font-medium text-slate-500">Plan</dt>
            <dd className="text-slate-800">{pro ? "Pro" : "Free"}</dd>
          </div>
        </dl>
        {pro && (
          <button
            type="button"
            onClick={() => void handlePortal()}
            disabled={portalBusy}
            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {portalBusy ? "Opening…" : "Manage billing"}
          </button>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-red-200 bg-red-50/50 p-5 sm:mt-8 sm:p-6">
        <h2 className="text-lg font-semibold text-red-900">Delete your account</h2>
        <p className="mt-2 text-sm leading-relaxed text-red-900/80">
          Permanently delete your Kigho account and all associated data, including:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-900/80">
          <li>Your profile and login</li>
          <li>Saved CV generations and history</li>
          <li>Job tracker applications and notes</li>
          <li>Master CV and application materials</li>
        </ul>
        <p className="mt-3 text-sm text-red-900/80">
          If you have an active Pro subscription, it will be cancelled. Deletion is permanent and
          cannot be undone.
        </p>
        <p className="mt-3 text-sm text-red-900/80">
          You can also request deletion by emailing{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="font-medium underline">
            {LEGAL_EMAIL}
          </a>{" "}
          with the subject &ldquo;Delete my account&rdquo;.
        </p>

        <label className="mt-6 block text-sm font-medium text-red-900">
          Type DELETE to confirm
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            placeholder="DELETE"
          />
        </label>

        {error && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={!canDelete || busy}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete my account permanently"}
        </button>
      </section>

      <p className="mt-8 text-center text-sm text-slate-500">
        See our{" "}
        <Link to="/privacy" className="font-medium text-olive-700 hover:underline">
          Privacy Policy
        </Link>{" "}
        for more on how we handle your data.
      </p>
    </div>
  );
}
