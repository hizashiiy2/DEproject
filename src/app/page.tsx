import Link from "next/link";
import { getDashboardStats } from "@/lib/repository";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const hasActivity = stats.presentationCount > 0 || stats.runCount > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        Quick view of your presentations and rehearsal progress.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Presentations</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
            {stats.presentationCount}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Rehearsal runs</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
            {stats.runCount}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Avg. confidence</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
            {stats.averageConfidence === null ? "—" : `${stats.averageConfidence} / 5`}
          </p>
        </div>
      </div>

      {!hasActivity ? (
        <div className="mt-10 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 p-8 dark:border-stone-700 dark:bg-stone-900/30">
          <p className="text-stone-700 dark:text-stone-300">
            Nothing here yet. Seed the database for sample data, or create your first presentation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/presentations/new"
              className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
            >
              New presentation
            </Link>
            <Link
              href="/presentations"
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              View list
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10">
          <Link
            href="/presentations"
            className="text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
          >
            Go to presentations →
          </Link>
        </div>
      )}
    </div>
  );
}
