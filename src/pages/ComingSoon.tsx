import { SiteFooter } from "../components/SiteFooter";

export function ComingSoon() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-600 text-xl font-bold text-white">
          K
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Coming soon
        </h1>
        <p className="mt-4 max-w-md text-lg text-slate-600">
          Kigho is almost ready — tailored CVs, ATS scoring, and your full job search workflow in
          one place.
        </p>
        <p className="mt-8 text-sm text-slate-500">We&apos;ll be live shortly. Check back soon.</p>
      </div>
      <SiteFooter />
    </div>
  );
}
