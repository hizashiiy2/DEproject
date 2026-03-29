import Link from "next/link";
import { listPresentations } from "@/lib/repository";

export default function PresentationsPage() {
  const presentations = listPresentations();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            Presentations
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Manage decks, section timing, and rehearsal history.
          </p>
        </div>
        <Link
          href="/presentations/new"
          className="inline-flex justify-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        >
          New presentation
        </Link>
      </div>

      {presentations.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-10 text-center dark:border-stone-700 dark:bg-stone-900/30">
          <p className="text-stone-700 dark:text-stone-300">No presentations yet.</p>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Create one to set a target length and start rehearsing.
          </p>
          <Link
            href="/presentations/new"
            className="mt-6 inline-block rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Create presentation
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {presentations.map((p) => (
            <li key={p.id}>
              <Link
                href={`/presentations/${p.id}`}
                className="block h-full rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-300 hover:shadow dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
              >
                <h2 className="font-semibold text-stone-900 dark:text-stone-100">{p.title}</h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{p.topic}</p>
                <p className="mt-3 text-xs text-stone-500 dark:text-stone-500">
                  Target {p.targetDurationMinutes} min · {p.audience}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
