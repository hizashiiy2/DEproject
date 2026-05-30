"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";

type Props = {
  /** GET target, e.g. "/presentations" or "/progress". */
  action: string;
  /** Query-string key to submit. Defaults to "q". */
  paramName?: string;
  placeholder?: string;
};

function SearchField({ action, paramName = "q", placeholder = "Search…" }: Props) {
  const searchParams = useSearchParams();
  const defaultValue = searchParams.get(paramName) ?? "";
  return (
    <form action={action} method="get" className="relative block w-full max-w-md">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">
        <MaterialIcon name="search" className="text-xl" />
      </span>
      <input
        type="search"
        name={paramName}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border-none bg-surface-container-low py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}

export function SearchInput(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-11 w-full max-w-md rounded-full bg-surface-container-low/60" aria-hidden />
      }
    >
      <SearchField {...props} />
    </Suspense>
  );
}
