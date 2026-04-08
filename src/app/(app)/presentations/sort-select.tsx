"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "modified", label: "Date modified" },
  { value: "title", label: "Alphabetical" },
  { value: "duration", label: "Duration" },
] as const;

export function PresentationsSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "modified";

  return (
    <label className="min-w-0 sm:max-w-[14rem]">
      <span className="sr-only">Sort presentations</span>
      <select
        value={OPTIONS.some((o) => o.value === sort) ? sort : "modified"}
        onChange={(e) => {
          const next = new URLSearchParams(searchParams.toString());
          next.set("sort", e.target.value);
          router.push(`/presentations?${next.toString()}`);
        }}
        className="w-full cursor-pointer border-none bg-transparent text-sm font-bold text-on-surface outline-none focus:ring-0"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
