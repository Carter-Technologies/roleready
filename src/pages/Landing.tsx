import { Link } from "react-router-dom";
import { FileText, Sparkles, History, Shield } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI tailoring in seconds",
    description:
      "Paste your CV and a job description — get a tailored CV and cover letter instantly.",
  },
  {
    icon: FileText,
    title: "PDF upload",
    description: "Upload your résumé as PDF or TXT. No more copy-paste struggles.",
  },
  {
    icon: History,
    title: "Saved history",
    description: "Every application saved to your account. Revisit, export, and reuse anytime.",
  },
  {
    icon: Shield,
    title: "Your data, your account",
    description: "Secure sign-in with private history. API keys never touch the browser.",
  },
];

export function Landing() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-block rounded-full bg-violet-100 px-4 py-1 text-sm font-medium text-violet-800">
            V2 — Job application copilot
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Apply faster. Get interviews.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            RoleReady tailors your CV and cover letter to every job description — with saved
            history, PDF upload, and professional exports.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-xl bg-violet-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
            >
              Start free
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
