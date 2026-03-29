import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100"
        >
          Rehearsal Coach
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Dashboard
          </Link>
          <Link
            href="/presentations"
            className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            Presentations
          </Link>
          <Link
            href="/presentations/new"
            className="rounded-md bg-stone-900 px-3 py-1.5 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            New
          </Link>
        </nav>
      </div>
    </header>
  );
}
