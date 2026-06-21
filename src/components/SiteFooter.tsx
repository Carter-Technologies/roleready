import { Link } from "react-router-dom";

const footerLinks = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/contact", label: "Contact" },
  { to: "/refunds", label: "Refunds" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/80">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <nav
          className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600"
          aria-label="Legal"
        >
          {footerLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-olive-700 hover:underline">
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-4 text-center text-sm text-slate-500">
          © 2026 Copperfield. Kigho is a Copperfield product.
        </p>
      </div>
    </footer>
  );
}
