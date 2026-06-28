import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ResetPassword() {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const message = await updatePassword(password);
    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    navigate("/app", { replace: true, state: { passwordReset: true } });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-slate-600 sm:px-6">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Link expired</h1>
        <p className="mt-2 text-slate-600">
          This reset link is invalid or has expired. Request a new one below.
        </p>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link to="/forgot-password" className="font-medium text-olive-700 hover:underline">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1>
      <p className="mt-2 text-slate-600">Enter your new password below.</p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:border-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-100"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Confirm password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:border-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-100"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-olive-600 py-3 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
        >
          {submitting ? "Please wait…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
