"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition hover:opacity-95"
    >
      <MaterialIcon name="print" className="text-on-primary text-sm" />
      Print / Save as PDF
    </button>
  );
}
