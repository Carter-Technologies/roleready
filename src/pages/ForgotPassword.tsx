import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    const message = await resetPasswordForEmail(email);
    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    setInfo("Check your email for a link to reset your password.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
      <p className="mt-2 text-slate-600">
        Enter your email and we&apos;ll send you a link to choose a new password.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-100"
            placeholder="you@email.com"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {info && <p className="text-sm text-emerald-700">{info}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-olive-600 py-3 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
        >
          {submitting ? "Please wait…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-olive-700 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
