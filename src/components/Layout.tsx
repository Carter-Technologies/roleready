import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navLinkClass = (active: boolean) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    active
      ? "bg-violet-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export function Layout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to={user ? "/app" : "/"} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white">
              RR
            </span>
            <span className="text-lg font-semibold text-slate-900">RoleReady</span>
          </Link>

          <nav className="flex items-center gap-1">
            {user ? (
              <>
                <Link to="/app" className={navLinkClass(location.pathname === "/app")}>
                  Tailor
                </Link>
                <Link
                  to="/history"
                  className={navLinkClass(location.pathname === "/history")}
                >
                  History
                </Link>
                <span className="hidden px-2 text-sm text-slate-500 sm:inline">
                  {profile?.full_name || profile?.email}
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="ml-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={navLinkClass(location.pathname === "/login")}>
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
