import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && !cancelled) {
          setError(exchangeError.message);
          return;
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;

      if (sessionError || !data.session) {
        setError(sessionError?.message || "Could not complete sign-in. The link may have expired.");
        return;
      }

      const next = searchParams.get("next") || "/app";
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/app";
      navigate(safeNext, { replace: true });
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">Link expired</h1>
        <p className="mt-2 text-slate-600">{error}</p>
        <p className="mt-6 text-sm text-slate-600">
          <Link to="/login" className="font-medium text-olive-700 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-sm text-slate-600 sm:px-6">
      Completing sign-in…
    </div>
  );
}
