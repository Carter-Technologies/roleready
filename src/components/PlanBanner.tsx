import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { canTailor, freeTailorRemaining, isPro } from "../lib/plan";

type PlanBannerProps = {
  className?: string;
};

export function PlanBanner({ className = "" }: PlanBannerProps) {
  const { profile } = useAuth();
  const pro = isPro(profile);

  if (!profile) {
    return null;
  }

  if (pro) {
    return (
      <div
        className={`rounded-xl border border-olive-200 bg-olive-50/60 px-4 py-3 text-sm text-olive-900 ${className}`}
      >
        <span className="font-semibold">Pro</span> — unlimited tailoring, ATS, tracker, and
        interview tools.
      </div>
    );
  }

  const remaining = freeTailorRemaining(profile);

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
    >
      <p>
        <span className="font-semibold">Free plan:</span>{" "}
        {remaining > 0
          ? `${remaining} CV generation left this month. ATS, tracker, and interview prep are Pro only.`
          : "You've used your free CV for this month."}
      </p>
      <Link to="/pricing" className="mt-2 inline-block font-semibold text-olive-800 hover:underline">
        Upgrade to Pro →
      </Link>
    </div>
  );
}

export function UpgradeButton({ label = "Upgrade to Pro" }: { label?: string }) {
  return (
    <Link
      to="/pricing"
      className="inline-flex rounded-xl bg-olive-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-olive-700"
    >
      {label}
    </Link>
  );
}

export function useCanTailor() {
  const { profile } = useAuth();
  return canTailor(profile);
}
