import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "login" | "signup";

export function Auth({ mode }: { mode: AuthMode }) {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    const message =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

    setSubmitting(false);

    if (message) {
      setError(message);
      return;
    }

    if (mode === "signup") {
      setInfo("Check your email to confirm your account, then log in.");
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-slate-600">
        {mode === "login"
          ? "Sign in to access your tailored CVs and history."
          : "Start tailoring applications in seconds."}
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-100"
              placeholder="Jane Smith"
            />
          </div>
        )}

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

        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-olive-400 focus:outline-none focus:ring-2 focus:ring-olive-100"
            placeholder="••••••••"
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
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            No account?{" "}
            <Link to="/signup" className="font-medium text-olive-700 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-olive-700 hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
