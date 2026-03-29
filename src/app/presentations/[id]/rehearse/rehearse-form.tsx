"use client";

import { useActionState } from "react";
import { createRehearsalRunAction, type ActionState } from "@/app/actions";
import { FieldErrors } from "@/app/components/FieldErrors";

type Props = { presentationId: string };

export function RehearseForm({ presentationId }: Props) {
  const [state, formAction, pending] = useActionState(
    createRehearsalRunAction,
    null as ActionState,
  );

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="presentationId" value={presentationId} />
      <div>
        <label htmlFor="runDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Rehearsal date
        </label>
        <input
          id="runDate"
          name="runDate"
          type="date"
          required
          defaultValue={today}
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="runDate" />
      </div>
      <div>
        <label
          htmlFor="actualDurationMinutes"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Actual duration (minutes)
        </label>
        <input
          id="actualDurationMinutes"
          name="actualDurationMinutes"
          type="number"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="actualDurationMinutes" />
      </div>
      <div>
        <label
          htmlFor="confidenceRating"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          Confidence (1–5)
        </label>
        <select
          id="confidenceRating"
          name="confidenceRating"
          required
          defaultValue="3"
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <FieldErrors errors={state?.errors} name="confidenceRating" />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="notes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {pending ? "Saving…" : "Save rehearsal"}
      </button>
    </form>
  );
}
