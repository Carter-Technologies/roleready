import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { isPro } from "../lib/plan";

export function ProRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (!isPro(profile)) {
    return <Navigate to="/pricing" replace state={{ from: location.pathname }} />;
  }

  return children;
}
