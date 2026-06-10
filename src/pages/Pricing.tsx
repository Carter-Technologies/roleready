import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { startCheckout, openBillingPortal } from "../lib/billingClient";
import { isPro } from "../lib/plan";
import { fetchProPricing } from "../lib/pricingClient";

const proFeatures = [
  "Unlimited CV tailoring",
  "ATS scoring and reports",
  "Job tracker (kanban)",
  "Interview prep",
  "Follow-up email drafts",
  "Full history and exports",
];

const freeFeatures = [
  "1 tailored CV per month",
  "View your generation in History",
  "Save master CV",
];

export function Pricing() {
  const { user, profile, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [proPrice, setProPrice] = useState<string | null>(null);
  const [priceInterval, setPriceInterval] = useState("month");
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("checkout") === "canceled";
  const pro = isPro(profile);

  useEffect(() => {
    void fetchProPricing()
      .then((p) => {
        setProPrice(p.formatted);
        setPriceInterval(p.interval);
      })
      .catch(() => setProPrice(null));
  }, []);

  const handleSubscribe = async () => {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const url = await startCheckout();
      window.location.href = url;
    } catch (err) {
      const e = err as Error & { code?: string };
      setError(e.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const handlePortal = async () => {
    setBusy(true);
    setError("");
    try {
      const url = await openBillingPortal();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open billing portal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Simple pricing</h1>
        <p className="mt-3 text-slate-600">
          Start free with one tailored CV each month. Go Pro when you're applying seriously.
        </p>
        {canceled && (
          <p className="mt-4 text-sm text-amber-800">Checkout canceled — you can try again anytime.</p>
        )}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Free</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            €0<span className="text-base font-normal text-slate-500">/month</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {freeFeatures.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="h-5 w-5 shrink-0 text-olive-600" />
                {f}
              </li>
            ))}
          </ul>
          {!user && !loading && (
            <Link
              to="/signup"
              className="mt-8 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Sign up free
            </Link>
          )}
          {user && !pro && (
            <p className="mt-8 text-center text-sm text-slate-500">Your current plan</p>
          )}
        </div>

        <div className="rounded-2xl border-2 border-olive-500 bg-white p-8 shadow-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-olive-700">Pro</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {proPrice ?? "…"}
            <span className="text-base font-normal text-slate-500">/{priceInterval}</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            {proFeatures.map((f) => (
              <li key={f} className="flex gap-2">
                <Check className="h-5 w-5 shrink-0 text-olive-600" />
                {f}
              </li>
            ))}
          </ul>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {pro ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handlePortal()}
              className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? "Loading…" : "Manage subscription"}
            </button>
          ) : user ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSubscribe()}
              className="mt-8 w-full rounded-xl bg-olive-600 py-3 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
            >
              {busy ? "Redirecting…" : "Subscribe to Pro"}
            </button>
          ) : (
            <Link
              to="/signup"
              className="mt-8 block w-full rounded-xl bg-olive-600 py-3 text-center text-sm font-semibold text-white hover:bg-olive-700"
            >
              Sign up to subscribe
            </Link>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        <Link to={user ? "/app" : "/"} className="text-olive-700 hover:underline">
          ← Back to app
        </Link>
      </p>
    </div>
  );
}
