"use client";

import { useActionState } from "react";
import { addSectionAction, type ActionState } from "@/app/actions";
import { FieldErrors } from "@/app/components/FieldErrors";

type Props = { presentationId: string };

export function AddSectionForm({ presentationId }: Props) {
  const [state, formAction, pending] = useActionState(
    addSectionAction,
    null as ActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <input type="hidden" name="presentationId" value={presentationId} />
      <div className="min-w-[12rem] flex-1">
        <label htmlFor="section-title" className="block text-xs font-medium text-stone-600 dark:text-stone-400">
          Section title
        </label>
        <input
          id="section-title"
          name="title"
          required
          placeholder="e.g. Introduction"
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="title" />
      </div>
      <div className="w-full sm:w-36">
        <label
          htmlFor="section-minutes"
          className="block text-xs font-medium text-stone-600 dark:text-stone-400"
        >
          Target (min)
        </label>
        <input
          id="section-minutes"
          name="targetDurationMinutes"
          type="number"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="targetDurationMinutes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-200 px-4 py-2 text-sm font-medium text-stone-900 hover:bg-stone-300 disabled:opacity-50 dark:bg-stone-700 dark:text-stone-100 dark:hover:bg-stone-600"
      >
        {pending ? "Adding…" : "Add section"}
      </button>
    </form>
  );
}
