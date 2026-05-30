"use client";

import { useActionState } from "react";
import { updatePresentationAction } from "@/actions/presentations";
import type { ActionState } from "@/actions/types";
import type { PresentationRow } from "@/db/repository";
import { FieldErrors } from "@/components/FieldErrors";
import { FormMessage } from "@/components/FormMessage";

type Props = {
  presentation: PresentationRow;
};

const label = "text-xs font-bold uppercase tracking-wider text-on-surface-variant";
const input =
  "mt-2 w-full rounded-t-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
const textarea =
  "mt-2 w-full resize-none rounded-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-low px-5 py-4 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

export function PresentationEditForm({ presentation }: Props) {
  const [state, formAction, pending] = useActionState(
    updatePresentationAction,
    null as ActionState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={presentation.id} />
      <FormMessage message={state?.message} />
      <div>
        <label htmlFor="title" className={label}>
          Title
        </label>
        <input id="title" name="title" required defaultValue={presentation.title} className={input} />
        <FieldErrors errors={state?.errors} name="title" />
      </div>
      <div>
        <label htmlFor="topic" className={label}>
          Topic
        </label>
        <input id="topic" name="topic" required defaultValue={presentation.topic} className={input} />
        <FieldErrors errors={state?.errors} name="topic" />
      </div>
      <div>
        <label htmlFor="audience" className={label}>
          Audience
        </label>
        <input
          id="audience"
          name="audience"
          required
          defaultValue={presentation.audience}
          className={input}
        />
        <FieldErrors errors={state?.errors} name="audience" />
      </div>
      <div>
        <label htmlFor="targetDurationMinutes" className={label}>
          Target duration (minutes)
        </label>
        <input
          id="targetDurationMinutes"
          name="targetDurationMinutes"
          type="number"
          min={1}
          required
          defaultValue={presentation.targetDurationMinutes}
          className={input}
        />
        <FieldErrors errors={state?.errors} name="targetDurationMinutes" />
      </div>
      <div>
        <label htmlFor="status" className={label}>
          Status
        </label>
        <select id="status" name="status" defaultValue={presentation.status} className={input}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <FieldErrors errors={state?.errors} name="status" />
      </div>
      <div>
        <label htmlFor="dueDate" className={label}>
          Due date (optional)
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={presentation.dueDate}
          className={input}
        />
        <FieldErrors errors={state?.errors} name="dueDate" />
      </div>
      <div>
        <label htmlFor="notes" className={label}>
          Notes
        </label>
        <textarea id="notes" name="notes" rows={4} defaultValue={presentation.notes} className={textarea} />
        <FieldErrors errors={state?.errors} name="notes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="academic-gradient tonal-depth rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
