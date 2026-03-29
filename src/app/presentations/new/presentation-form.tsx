"use client";

import { useActionState } from "react";
import { createPresentation, type ActionState } from "@/app/actions";
import { FieldErrors } from "@/app/components/FieldErrors";

export function PresentationNewForm() {
  const [state, formAction, pending] = useActionState(
    createPresentation,
    null as ActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="title" />
      </div>
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Topic
        </label>
        <input
          id="topic"
          name="topic"
          required
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="topic" />
      </div>
      <div>
        <label htmlFor="audience" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Audience
        </label>
        <input
          id="audience"
          name="audience"
          required
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="audience" />
      </div>
      <div>
        <label
          htmlFor="targetDurationMinutes"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Target duration (minutes)
        </label>
        <input
          id="targetDurationMinutes"
          name="targetDurationMinutes"
          type="number"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="targetDurationMinutes" />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="notes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {pending ? "Saving…" : "Create presentation"}
      </button>
    </form>
  );
}
