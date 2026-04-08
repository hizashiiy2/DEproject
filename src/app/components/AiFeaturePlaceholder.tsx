type Props = {
  /** Short label shown in the disabled control */
  label?: string;
  className?: string;
};

/** Marks UI that would use AI in a fuller product; disabled for this coursework scope. */
export function AiFeaturePlaceholder({ label = "AI feature not enabled", className = "" }: Props) {
  return (
    <span
      className={`inline-block rounded-md border border-outline-variant/40 bg-surface-container-low px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant ${className}`.trim()}
      title="Intelligence features are out of scope for this project build."
    >
      {label}
    </span>
  );
}
