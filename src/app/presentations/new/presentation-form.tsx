"use client";

import { useActionState } from "react";
import { createPresentation } from "@/actions/presentations";
import type { ActionState } from "@/actions/types";
import { FieldErrors } from "@/components/FieldErrors";

const label = "text-xs font-bold uppercase tracking-wider text-on-surface-variant";
const input =
  "mt-2 w-full rounded-t-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";
const textarea =
  "mt-2 w-full resize-none rounded-xl border-0 border-b-2 border-outline-variant/40 bg-surface-container-low px-5 py-4 text-on-surface outline-none transition placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/10";

export function PresentationNewForm() {
  const [state, formAction, pending] = useActionState(
    createPresentation,
    null as ActionState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label htmlFor="title" className={label}>
          Title
        </label>
        <input id="title" name="title" required className={input} />
        <FieldErrors errors={state?.errors} name="title" />
      </div>
      <div>
        <label htmlFor="topic" className={label}>
          Topic
        </label>
        <input id="topic" name="topic" required className={input} />
        <FieldErrors errors={state?.errors} name="topic" />
      </div>
      <div>
        <label htmlFor="audience" className={label}>
          Audience
        </label>
        <input id="audience" name="audience" required className={input} />
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
          className={input}
        />
        <FieldErrors errors={state?.errors} name="targetDurationMinutes" />
      </div>
      <div>
        <label htmlFor="status" className={label}>
          Status
        </label>
        <select id="status" name="status" defaultValue="active" className={input}>
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
        <input id="dueDate" name="dueDate" type="date" className={input} />
        <FieldErrors errors={state?.errors} name="dueDate" />
      </div>
      <div>
        <label htmlFor="notes" className={label}>
          Notes
        </label>
        <textarea id="notes" name="notes" rows={4} className={textarea} />
        <FieldErrors errors={state?.errors} name="notes" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="academic-gradient tonal-depth rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Create presentation"}
      </button>
    </form>
  );
}
