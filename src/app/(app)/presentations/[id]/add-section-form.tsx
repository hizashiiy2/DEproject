"use client";

import { useActionState } from "react";
import { addSectionAction, type ActionState } from "@/app/actions";
import { FieldErrors } from "@/app/components/FieldErrors";

type Props = { presentationId: string };

const label = "text-xs font-bold uppercase tracking-wider text-on-surface-variant";
const input =
  "mt-1 w-full rounded-t-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export function AddSectionForm({ presentationId }: Props) {
  const [state, formAction, pending] = useActionState(
    addSectionAction,
    null as ActionState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <input type="hidden" name="presentationId" value={presentationId} />
      <div className="min-w-[12rem] flex-1">
        <label htmlFor="section-title" className={label}>
          Section title
        </label>
        <input
          id="section-title"
          name="title"
          required
          placeholder="e.g. Introduction"
          className={input}
        />
        <FieldErrors errors={state?.errors} name="title" />
      </div>
      <div className="w-full sm:w-36">
        <label htmlFor="section-minutes" className={label}>
          Target (min)
        </label>
        <input
          id="section-minutes"
          name="targetDurationMinutes"
          type="number"
          min={1}
          required
          className={input}
        />
        <FieldErrors errors={state?.errors} name="targetDurationMinutes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-secondary-container px-4 py-2.5 text-sm font-bold text-on-secondary-container transition hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add section"}
      </button>
    </form>
  );
}
