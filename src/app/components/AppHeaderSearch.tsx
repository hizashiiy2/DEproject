"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/app/components/MaterialIcon";

function AppHeaderSearchFields() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onLibrary = pathname === "/presentations" || pathname.startsWith("/presentations/");
  const defaultQ = onLibrary ? (searchParams.get("q") ?? "") : "";

  return (
    <form action="/presentations" method="get" className="relative block w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">
        <MaterialIcon name="search" className="text-xl" />
      </span>
      <input
        type="search"
        name="q"
        defaultValue={defaultQ}
        placeholder="Search presentations..."
        className="w-full rounded-full border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary/20"
        aria-label="Search presentations by title or topic"
      />
    </form>
  );
}

export function AppHeaderSearch() {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-full max-w-md rounded-full bg-surface-container-low/60" aria-hidden />
      }
    >
      <AppHeaderSearchFields />
    </Suspense>
  );
}
