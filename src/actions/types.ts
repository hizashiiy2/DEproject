/** Shared return type for `useActionState`-driven server actions. */
export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;
