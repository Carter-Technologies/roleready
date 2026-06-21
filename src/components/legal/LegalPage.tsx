import type { ReactNode } from "react";
import { useMetaDescription, usePageTitle } from "../../hooks/usePageTitle";

type LegalPageProps = {
  title: string;
  description: string;
  lastUpdated?: string;
  children: ReactNode;
};

export function LegalPage({ title, description, lastUpdated, children }: LegalPageProps) {
  usePageTitle(title);
  useMetaDescription(description);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {lastUpdated && <p className="mt-2 text-sm text-slate-500">Last updated: {lastUpdated}</p>}
      </header>
      <div className="mt-8 space-y-8 text-base leading-relaxed text-slate-700">{children}</div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
