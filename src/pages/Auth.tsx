import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type AuthMode = "login" | "signup";

function formatAuthError(message: string, mode: AuthMode): string {
  const lower = message.toLowerCase();
  if (mode === "login" && (lower.includes("email not confirmed") || lower.includes("not verified"))) {
    return "Please confirm your email before logging in. Check your inbox for the confirmation link we sent when you signed up.";
  }
  return message;
}

export function Auth({ mode }: { mode: AuthMode }) {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: string } | null)?.from ?? "/app";
  const emailConfirmed = searchParams.get("confirmed") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [signupComplete, setSignupComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setSubmitting(true);

    const message =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

    setSubmitting(false);

    if (message) {
      setError(formatAuthError(message, mode));
      return;
    }

    if (mode === "signup") {
      setSignupComplete(true);
      return;
    }

    navigate(from, { replace: true });
  };

  if (mode === "signup" && signupComplete) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-olive-200 bg-olive-50/60 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-olive-600 text-lg font-bold text-white">
            ✉
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Confirm your email</h1>
          <p className="mt-3 text-slate-600">
            We&apos;ve sent a confirmation link to{" "}
            <strong className="font-medium text-slate-900">{email}</strong>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Click the link in that email to activate your account. You&apos;ll be brought back to
            Kigho automatically — then you can log in and start tailoring applications.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            Didn&apos;t get it? Check spam, or wait a minute and try signing up again.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-block rounded-xl bg-olive-600 px-6 py-3 text-sm font-semibold text-white hover:bg-olive-700"
          >
            Go to log in
          </Link>
        </div>
      </div>
    );
  }

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

      {mode === "signup" && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You&apos;ll need to <strong className="font-medium text-slate-800">confirm your email</strong>{" "}
          before you can log in. We&apos;ll send you a link right after sign-up.
        </p>
      )}

      {mode === "login" && emailConfirmed && (
        <p className="mt-4 rounded-xl border border-olive-200 bg-olive-50 px-4 py-3 text-sm text-olive-900">
          Your email is confirmed. Log in to continue.
        </p>
      )}

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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Password</label>
            {mode === "login" && (
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-olive-700 hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
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

        {mode === "signup" && (
          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-olive-600 focus:ring-olive-500"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="font-medium text-olive-700 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium text-olive-700 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        )}

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
