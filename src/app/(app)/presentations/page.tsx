import { Suspense } from "react";
import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  getPresentationStatusCounts,
  listPresentationsWithMeta,
  type PresentationListQuery,
} from "@/lib/repository";
import { PresentationCard } from "./presentation-card";
import { PresentationsSortSelect } from "./sort-select";

function formatLastPracticed(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(`${iso}T12:00:00`);
  const today = new Date();
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - d.setHours(0, 0, 0, 0)) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function buildHref(opts: { q?: string; sort?: string; status?: string }) {
  const p = new URLSearchParams();
  if (opts.q && opts.q.trim()) p.set("q", opts.q.trim());
  if (opts.sort && opts.sort !== "modified") p.set("sort", opts.sort);
  if (opts.status) p.set("status", opts.status);
  const s = p.toString();
  return s ? `/presentations?${s}` : "/presentations";
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PresentationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const sortRaw = typeof sp.sort === "string" ? sp.sort : "modified";
  const sort =
    sortRaw === "title" || sortRaw === "duration" || sortRaw === "modified"
      ? sortRaw
      : "modified";
  const st = typeof sp.status === "string" ? sp.status : undefined;
  const status =
    st === "draft" || st === "active" || st === "completed" ? st : undefined;

  const query: PresentationListQuery = {
    q: q.trim() || undefined,
    sort,
    status,
  };

  const presentations = listPresentationsWithMeta(query);
  const counts = getPresentationStatusCounts();

  const chipClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      active
        ? "border border-outline-variant/30 bg-surface-container-lowest font-semibold text-primary shadow-sm"
        : "text-on-surface-variant hover:bg-surface-container-low"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 md:p-10">
      <div className="mb-8 w-fit rounded-full bg-surface-container-high/30 px-3 py-1.5">
        <AcademicBreadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My presentations" },
          ]}
        />
      </div>

      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            My presentations
          </h2>
          <p className="max-w-lg text-lg text-on-surface-variant">
            Manage and rehearse your academic presentations with editorial precision.
          </p>
        </div>
        <Link
          href="/presentations/new"
          className="academic-gradient flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-on-primary shadow-md shadow-primary/10 transition active:scale-[0.98]"
        >
          <MaterialIcon name="add_circle" className="text-on-primary" />
          New presentation
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href={buildHref({ q, sort })}
          className={`flex items-center gap-2 px-4 py-2 ${chipClass(!status)}`}
        >
          All projects
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
            {counts.all}
          </span>
        </Link>
        <Link
          href={buildHref({ q, sort, status: "draft" })}
          className={`flex items-center gap-2 ${chipClass(status === "draft")}`}
        >
          Drafts
          <span className="rounded-full bg-on-surface-variant/10 px-1.5 py-0.5 text-[10px] text-on-surface-variant">
            {counts.draft}
          </span>
        </Link>
        <Link
          href={buildHref({ q, sort, status: "active" })}
          className={`flex items-center gap-2 ${chipClass(status === "active")}`}
        >
          Active
          <span className="rounded-full bg-on-surface-variant/10 px-1.5 py-0.5 text-[10px] text-on-surface-variant">
            {counts.active}
          </span>
        </Link>
        <Link
          href={buildHref({ q, sort, status: "completed" })}
          className={`flex items-center gap-2 ${chipClass(status === "completed")}`}
        >
          Completed
          <span className="rounded-full bg-on-surface-variant/10 px-1.5 py-0.5 text-[10px] text-on-surface-variant">
            {counts.completed}
          </span>
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-2">
          <span className="hidden text-xs font-medium text-on-surface-variant sm:inline">Sort by:</span>
          <Suspense
            fallback={
              <span className="inline-block h-9 w-40 rounded-lg bg-surface-container-low/50" aria-hidden />
            }
          >
            <PresentationsSortSelect />
          </Suspense>
        </div>
      </div>

      {q.trim() && (
        <p className="mb-6 text-sm text-on-surface-variant">
          {presentations.length} result{presentations.length === 1 ? "" : "s"} for &quot;{q.trim()}&quot; ·{" "}
          <Link href={buildHref({ sort, status })} className="font-semibold text-primary underline">
            Clear search
          </Link>
        </p>
      )}

      {presentations.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low/40 p-16 text-center">
          <p className="font-headline text-lg font-bold text-on-surface">
            {counts.all === 0
              ? "No presentations yet"
              : "No presentations match these filters"}
          </p>
          <p className="mt-2 text-on-surface-variant">
            {counts.all === 0
              ? "Create one to set targets and log rehearsals."
              : "Try another status or search term."}
          </p>
          <Link
            href="/presentations/new"
            className="academic-gradient mt-6 inline-flex rounded-xl px-8 py-3 text-sm font-bold text-on-primary"
          >
            Create presentation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {presentations.map((p, i) => (
            <PresentationCard
              key={p.id}
              presentation={{ ...p }}
              index={i}
              lastPracticedLabel={formatLastPracticed(p.lastPracticed)}
            />
          ))}
          <Link
            href="/presentations/new"
            className="group flex min-h-[250px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-outline-variant/30 p-6 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container transition group-hover:scale-110">
              <MaterialIcon name="cancel_presentation" className="text-3xl text-outline" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-on-surface">Add new presentation</span>
              <span className="text-sm text-on-surface-variant">Start from scratch or a template</span>
            </div>
          </Link>
        </div>
      )}

      <div className="relative mt-16 flex flex-col items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-surface-container-low to-surface-container p-8 md:flex-row">
        <div className="relative z-10 md:w-2/3">
          <span className="mb-4 inline-block rounded-full bg-tertiary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-tertiary">
            Academic insight
          </span>
          <h4 className="mb-4 font-headline text-2xl font-bold text-on-surface">Master the 10-20-30 rule</h4>
          <p className="mb-6 text-base leading-relaxed text-on-surface-variant">
            Most academic panels prefer concise delivery: about ten slides, twenty minutes, and no font smaller
            than thirty points. Use section targets in DEproject to rehearse with that discipline.
          </p>
          <Link href="/presentations/new" className="flex items-center gap-2 font-bold text-primary hover:gap-3">
            Start a deck
            <MaterialIcon name="arrow_right_alt" />
          </Link>
        </div>
        <div className="relative flex justify-center md:w-1/3">
          <div className="flex h-48 w-48 rotate-12 items-center justify-center rounded-2xl border border-white/50 bg-white/40 shadow-2xl backdrop-blur-xl">
            <MaterialIcon name="lightbulb" className="text-6xl text-primary/30" />
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
