"use client";

import { updatePresentationStatusAction } from "@/actions/presentations";
import type { PresentationStatus } from "@/domain/presentation-status";

const OPTIONS: { value: PresentationStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

type Props = { presentationId: string; status: PresentationStatus };

export function PresentationStatusForm({ presentationId, status }: Props) {
  return (
    <form action={updatePresentationStatusAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={presentationId} />
      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        Status
        <select
          name="status"
          defaultValue={status}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="ml-2 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
