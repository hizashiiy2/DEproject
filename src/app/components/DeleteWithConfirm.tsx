"use client";

import type { ReactNode } from "react";

type Props = {
  formAction: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  confirmMessage: string;
};

export function DeleteWithConfirm({
  formAction,
  children,
  confirmMessage,
}: Props) {
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
