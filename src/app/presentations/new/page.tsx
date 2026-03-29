import Link from "next/link";
import { PresentationNewForm } from "./presentation-form";

export default function NewPresentationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link
          href="/presentations"
          className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          ← Back to presentations
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          New presentation
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Set a target length and who you are speaking to. You can add sections on the next screen.
        </p>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <PresentationNewForm />
      </div>
    </div>
  );
}
