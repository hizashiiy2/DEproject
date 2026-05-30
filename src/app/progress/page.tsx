import Link from "next/link";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import {
  getDashboardStats,
  getPerPresentationProgress,
  getTotalPracticeMinutes,
  listRehearsalsDetailed,
} from "@/db/repository";
import { compareTargetVsActual } from "@/domain/duration";
import { summariseTiming } from "@/domain/progress";
import { AcademicBreadcrumb } from "@/components/AcademicBreadcrumb";
import { MaterialIcon, type IconName } from "@/components/MaterialIcon";
import { SearchInput } from "@/components/SearchInput";

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function ProgressPage({ searchParams }: PageProps) {
  await ensureDynamicDb();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const stats = getDashboardStats();
  const practiceMinutes = getTotalPracticeMinutes();
  const allRuns = listRehearsalsDetailed();
  const filtered = q.trim() ? listRehearsalsDetailed(q) : allRuns;
  const perPresentation = getPerPresentationProgress();
  const timing = summariseTiming(allRuns);

  // Confidence trend, oldest → newest, capped to a readable window.
  const trend = [...allRuns].reverse().slice(-14);

  const cards: { label: string; value: string | number; icon: IconName }[] = [
    { label: "Rehearsals", value: stats.runCount, icon: "history_edu" },
    { label: "Practice minutes", value: practiceMinutes, icon: "timer" },
    {
      label: "Avg confidence",
      value: stats.averageConfidence === null ? "—" : `${stats.averageConfidence}/5`,
      icon: "trending_up",
    },
    { label: "On-target runs", value: `${timing.onTargetPct}%`, icon: "track_changes" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
      <AcademicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Progress" }]} />

      <header className="mt-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Progress
        </h1>
        <p className="mt-2 text-on-surface-variant">
          How your preparation is going — computed from your real rehearsal logs.
        </p>
      </header>

      {stats.runCount === 0 ? (
        <div className="mt-10 rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low/40 p-16 text-center">
          <p className="font-headline text-lg font-bold text-on-surface">No rehearsal data yet</p>
          <p className="mt-2 text-on-surface-variant">
            Log a rehearsal to see confidence, timing accuracy, and practice trends here.
          </p>
          <Link
            href="/presentations"
            className="academic-gradient mt-6 inline-flex rounded-xl px-8 py-3 text-sm font-bold text-on-primary"
          >
            Go to presentations
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-xl bg-surface-container-lowest p-5 tonal-depth">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary">
                  <MaterialIcon name={c.icon} />
                </div>
                <div className="font-headline text-2xl font-extrabold text-on-surface">{c.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {c.label}
                </div>
              </div>
            ))}
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
              <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">Confidence trend</h2>
              <p className="mb-4 text-xs text-on-surface-variant">Most recent {trend.length} runs</p>
              <div className="flex h-32 items-end gap-1.5">
                {trend.map((r) => (
                  <div
                    key={r.id}
                    title={`${formatDate(r.runDate)} · ${r.confidenceRating}/5`}
                    className="academic-gradient flex-1 rounded-t"
                    style={{ height: `${(r.confidenceRating / 5) * 100}%` }}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
              <h2 className="mb-4 font-headline text-lg font-bold text-on-surface">Timing accuracy</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-surface-container-low p-4">
                  <div className="font-headline text-2xl font-extrabold text-on-surface">{timing.under}</div>
                  <div className="text-xs text-on-surface-variant">Under</div>
                </div>
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="font-headline text-2xl font-extrabold text-primary">{timing.on}</div>
                  <div className="text-xs text-on-surface-variant">On target</div>
                </div>
                <div className="rounded-lg bg-surface-container-low p-4">
                  <div className="font-headline text-2xl font-extrabold text-on-surface">{timing.over}</div>
                  <div className="text-xs text-on-surface-variant">Over</div>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-8">
            <h2 className="mb-3 font-headline text-lg font-bold text-on-surface">By presentation</h2>
            <div className="overflow-hidden rounded-xl bg-surface-container-lowest tonal-depth">
              {perPresentation.map((p) => (
                <Link
                  key={p.presentationId}
                  href={`/presentations/${p.presentationId}`}
                  className="flex items-center justify-between gap-3 border-b border-outline-variant/5 px-5 py-4 transition last:border-0 hover:bg-surface-container"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-on-surface">{p.title}</div>
                    <div className="text-xs text-on-surface-variant">
                      {p.runCount} run{p.runCount === 1 ? "" : "s"}
                      {p.lastPracticed ? ` · last ${formatDate(p.lastPracticed)}` : " · not practiced"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 text-sm">
                    <span className="text-on-surface-variant">
                      {p.avgConfidence === null ? "—" : `${p.avgConfidence}/5`}
                    </span>
                    <span className="text-on-surface-variant">
                      {p.avgActual === null ? "—" : `${p.avgActual}/${p.targetDurationMinutes}m`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-headline text-lg font-bold text-on-surface">Rehearsal log</h2>
              <SearchInput action="/progress" placeholder="Search rehearsals…" />
            </div>
            {filtered.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No rehearsals match &quot;{q.trim()}&quot;.{" "}
                <Link href="/progress" className="font-semibold text-primary underline">
                  Clear
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((r) => {
                  const cmp = compareTargetVsActual(r.targetDurationMinutes, r.actualDurationMinutes);
                  const timingColor =
                    cmp.status === "on"
                      ? "text-primary"
                      : cmp.status === "over"
                        ? "text-error"
                        : "text-on-surface-variant";
                  return (
                    <li
                      key={r.id}
                      className="rounded-xl bg-surface-container-lowest p-4 tonal-depth"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/presentations/${r.presentationId}`}
                          className="font-semibold text-on-surface hover:text-primary"
                        >
                          {r.presentationTitle}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                          <span>{formatDate(r.runDate)}</span>
                          <span className={timingColor}>
                            {r.actualDurationMinutes}/{r.targetDurationMinutes}m
                          </span>
                          <span>{r.confidenceRating}/5</span>
                        </div>
                      </div>
                      {r.notes.trim() && (
                        <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{r.notes}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
