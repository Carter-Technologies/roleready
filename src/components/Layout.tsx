import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { isPro } from "../lib/plan";
import { SiteFooter } from "./SiteFooter";

const navLinkClass = (active: boolean) =>
  `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    active
      ? "bg-olive-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

const desktopNavLinkClass = (active: boolean) =>
  `rounded-lg px-2.5 py-2 text-sm font-medium transition lg:px-3 ${
    active
      ? "bg-olive-600 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export function Layout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const pro = isPro(profile);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const trackerPath = pro ? "/tracker" : "/pricing";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header
        className={`sticky top-0 z-50 border-b border-slate-200/80 md:relative ${
          menuOpen ? "bg-white" : "bg-white/80 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            to={user ? "/app" : "/"}
            className="flex shrink-0 items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-olive-600 text-sm font-bold text-white">
              K
            </span>
            <span className="text-lg font-semibold text-slate-900">Kigho</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex lg:gap-1">
            {user ? (
              <>
                <Link to="/app" className={desktopNavLinkClass(location.pathname === "/app")}>
                  Tailor
                </Link>
                <Link to={trackerPath} className={desktopNavLinkClass(location.pathname === "/tracker")}>
                  Tracker
                </Link>
                <Link to="/history" className={desktopNavLinkClass(location.pathname === "/history")}>
                  History
                </Link>
                <Link to="/settings" className={desktopNavLinkClass(location.pathname === "/settings")}>
                  Account
                </Link>
                <Link
                  to="/pricing"
                  className={
                    pro
                      ? "hidden lg:inline rounded-lg px-2 py-1 text-xs font-medium text-olive-700"
                      : "rounded-lg bg-olive-600 px-2.5 py-2 text-sm font-medium text-white hover:bg-olive-700 lg:px-3"
                  }
                >
                  {pro ? "Pro" : "Upgrade"}
                </Link>
                <span className="hidden px-2 text-sm text-slate-500 xl:inline">
                  {profile?.full_name || profile?.email}
                </span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="ml-1 rounded-lg border border-slate-200 px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:ml-2 lg:px-3"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/pricing" className={desktopNavLinkClass(location.pathname === "/pricing")}>
                  Pricing
                </Link>
                <Link to="/login" className={desktopNavLinkClass(location.pathname === "/login")}>
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-olive-600 px-3 py-2 text-sm font-medium text-white hover:bg-olive-700 lg:px-4"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu panel — solid white, no overlay */}
        {menuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            {user ? (
              <div className="space-y-1">
                {(profile?.full_name || profile?.email) && (
                  <p className="px-3 pb-2 text-sm text-slate-500">
                    {profile?.full_name || profile?.email}
                  </p>
                )}
                <Link to="/app" className={navLinkClass(location.pathname === "/app")}>
                  Tailor
                </Link>
                <Link to={trackerPath} className={navLinkClass(location.pathname === trackerPath)}>
                  Tracker
                </Link>
                <Link to="/history" className={navLinkClass(location.pathname === "/history")}>
                  History
                </Link>
                <Link to="/settings" className={navLinkClass(location.pathname === "/settings")}>
                  Account
                </Link>
                <Link to="/pricing" className={navLinkClass(location.pathname === "/pricing")}>
                  {pro ? "Billing" : "Upgrade to Pro"}
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link to="/pricing" className={navLinkClass(location.pathname === "/pricing")}>
                  Pricing
                </Link>
                <Link to="/login" className={navLinkClass(location.pathname === "/login")}>
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block rounded-lg bg-olive-600 px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-olive-700"
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}
