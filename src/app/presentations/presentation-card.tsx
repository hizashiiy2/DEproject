"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import type { PresentationListExtras } from "@/db/repository";

const wraps = [
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  "bg-primary-fixed text-on-primary-fixed-variant",
  "bg-surface-container-highest text-on-surface-variant",
] as const;
const icons = ["auto_stories", "science", "architecture", "history_edu"] as const;

type Props = {
  presentation: PresentationListExtras;
  index: number;
  /** Preformatted on the server (functions cannot cross the RSC → client boundary). */
  lastPracticedLabel: string;
};

export function PresentationCard({ presentation: p, index: i, lastPracticedLabel }: Props) {
  return (
    <div className="group relative flex h-full flex-col rounded-xl border border-transparent bg-surface-container-lowest shadow-none transition hover:border-outline-variant/10 hover:shadow-xl hover:shadow-on-surface/5">
      <div className="mb-6 flex items-start justify-between px-6 pb-0 pt-6">
        <Link
          href={`/presentations/${p.id}`}
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${wraps[i % wraps.length]}`}
        >
          <MaterialIcon name={icons[i % icons.length]!} />
        </Link>
        <details className="relative z-20">
          <summary className="list-none cursor-pointer rounded-md p-1.5 text-on-surface-variant marker:hidden hover:bg-surface-container [&::-webkit-details-marker]:hidden">
            <MaterialIcon name="more_vert" className="text-xl" />
          </summary>
          <div className="absolute right-0 mt-1 min-w-[11rem] rounded-lg border border-outline-variant/15 bg-surface-container-lowest py-1 tonal-depth">
            <Link
              href={`/presentations/${p.id}`}
              className="block px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low"
            >
              Open
            </Link>
            <Link
              href={`/presentations/${p.id}/rehearse`}
              className="block px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low"
            >
              Log rehearsal
            </Link>
            <Link
              href={`/presentations/${p.id}/edit`}
              className="block px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container-low"
            >
              Edit details
            </Link>
          </div>
        </details>
      </div>
      <Link href={`/presentations/${p.id}`} className="flex flex-1 flex-col px-6 pb-6">
        <h3 className="mb-2 font-headline text-xl font-bold text-on-surface transition group-hover:text-primary">
          {p.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-on-surface-variant">{p.topic}</p>
        <span className="mb-4 inline-flex w-fit rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {p.status}
        </span>
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <MaterialIcon name="schedule" className="text-sm" />
              {String(p.targetDurationMinutes).padStart(2, "0")}:00
            </span>
            <span className="flex items-center gap-1.5">
              <MaterialIcon name="layers" className="text-sm" />
              {Number(p.sectionCount)} sections
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-surface-container-low pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-outline">Last practiced</span>
            <span className="text-xs font-semibold text-on-surface">
              {lastPracticedLabel}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
