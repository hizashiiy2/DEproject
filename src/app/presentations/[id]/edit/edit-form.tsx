"use client";

import { useActionState } from "react";
import { updatePresentationAction, type ActionState } from "@/app/actions";
import type { PresentationRow } from "@/lib/repository";
import { FieldErrors } from "@/app/components/FieldErrors";
import { FormMessage } from "@/app/components/FormMessage";

type Props = {
  presentation: PresentationRow;
};

export function PresentationEditForm({ presentation }: Props) {
  const [state, formAction, pending] = useActionState(
    updatePresentationAction,
    null as ActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={presentation.id} />
      <FormMessage message={state?.message} />
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={presentation.title}
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
          defaultValue={presentation.topic}
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
          defaultValue={presentation.audience}
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
          defaultValue={presentation.targetDurationMinutes}
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
          defaultValue={presentation.notes}
          className="mt-1 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 shadow-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <FieldErrors errors={state?.errors} name="notes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
