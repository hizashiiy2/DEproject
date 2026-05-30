import Link from "next/link";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { getSynopsis } from "@/db/repository";
import { MaterialIcon } from "@/components/MaterialIcon";
import { PrintButton } from "./print-button";

export const metadata = {
  title: "Synopsis · Print",
  description: "Print-ready 1-page exam synopsis.",
};

export default async function SynopsisPrintPage() {
  await ensureDynamicDb();
  const s = getSynopsis();

  if (!s) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-on-surface-variant">No synopsis saved yet.</p>
        <Link href="/synopsis" className="mt-4 inline-block font-bold text-primary hover:underline">
          Build your synopsis first →
        </Link>
      </div>
    );
  }

  const features = s.features
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);
  const updated = new Date(s.updatedAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-surface print:bg-white">
      <div className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href="/synopsis"
            className="flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            Back to builder
          </Link>
          <PrintButton />
        </div>

        <article className="rounded-xl bg-white p-10 text-black tonal-depth print:rounded-none print:p-0 print:shadow-none">
          <header className="border-b-2 border-black/80 pb-4">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight">{s.title}</h1>
            <p className="mt-1 text-sm text-black/60">
              Exam synopsis · Topics in focus: <strong>{s.topicOne}</strong> &amp;{" "}
              <strong>{s.topicTwo}</strong>
            </p>
          </header>

          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">Overview</h2>
            <p className="mt-2 leading-relaxed">{s.description}</p>
          </section>

          {features.length > 0 && (
            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">
                Prototype features
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">Technologies</h2>
            <p className="mt-2 leading-relaxed">{s.technologies}</p>
          </section>

          {s.githubUrl && (
            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">Link</h2>
              <p className="mt-2 break-all leading-relaxed">{s.githubUrl}</p>
            </section>
          )}

          {s.reflection && (
            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-black/50">Reflection</h2>
              <p className="mt-2 leading-relaxed">{s.reflection}</p>
            </section>
          )}

          <footer className="mt-8 border-t border-black/20 pt-3 text-xs text-black/50">
            Last updated {updated}
          </footer>
        </article>
      </div>
    </div>
  );
}
