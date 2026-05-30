export type PresentationStatus = "draft" | "active" | "completed";

export const PRESENTATION_STATUS_VALUES = ["draft", "active", "completed"] as const;

export function parsePresentationStatus(v: unknown): PresentationStatus | undefined {
  if (v === "draft" || v === "active" || v === "completed") return v;
  return undefined;
}
