import Link from "next/link";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import {
  getDashboardStats,
  getSynopsis,
  getTotalPracticeMinutes,
  getTotalSectionCount,
  listPresentationsWithMeta,
  listRecentActivity,
} from "@/db/repository";
import {
  computeReadiness,
  readinessScore,
  QA_TOOLS,
} from "@/domain/readiness";
import { EXAM_DATE_ISO, daysUntil } from "@/domain/exam";
import { MaterialIcon, type IconName } from "@/components/MaterialIcon";

function formatRunDate(runDate: string, startedAt: string): string {
  const d = new Date(startedAt || `${runDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return runDate;
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HomePage() {
  await ensureDynamicDb();

  const stats = getDashboardStats();
  const synopsis = getSynopsis();
  const sectionCount = getTotalSectionCount();
  const practiceMinutes = getTotalPracticeMinutes();
  const recent = listRecentActivity(5);
  const topPresentation = listPresentationsWithMeta({ sort: "modified" })[0] ?? null;

  const topicCount = synopsis
    ? [synopsis.topicOne, synopsis.topicTwo].filter((t) => t.trim().length > 0).length
    : 0;
  const checks = computeReadiness({
    hasSynopsis: Boolean(synopsis),
    topicCount,
    presentationCount: stats.presentationCount,
    sectionCount,
    rehearsalCount: stats.runCount,
  });
  const score = readinessScore(checks);
  const days = daysUntil(EXAM_DATE_ISO);

  const headlineStats: { label: string; value: string | number; icon: IconName }[] = [
    { label: "Presentations", value: stats.presentationCount, icon: "present_to_all" },
    { label: "Rehearsals", value: stats.runCount, icon: "history_edu" },
    { label: "Practice minutes", value: practiceMinutes, icon: "timer" },
    {
      label: "Avg confidence",
      value: stats.averageConfidence === null ? "—" : `${stats.averageConfidence}/5`,
      icon: "trending_up",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Exam readiness
          </h1>
          <p className="mt-2 text-on-surface-variant">
            Prepare, rehearse, and track your way to the DE oral exam.
          </p>
        </div>
        <Link
          href="/presentations/new"
          className="academic-gradient tonal-depth flex items-center gap-2 rounded-xl px-6 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95"
        >
          <MaterialIcon name="add" className="text-on-primary" />
          New presentation
        </Link>
      </header>

      <section className="academic-gradient mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl px-6 py-5 text-on-primary">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-on-primary/15">
            <MaterialIcon name="event" filled className="text-on-primary" />
          </div>
          <div>
            <div className="font-headline text-2xl font-extrabold leading-none">
              {days === 0 ? "Exam day" : `${days} day${days === 1 ? "" : "s"} to go`}
            </div>
            <div className="text-sm text-on-primary/80">DE oral exam · 3 June 2026</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-headline text-2xl font-extrabold leading-none">{score.percent}%</div>
          <div className="text-sm text-on-primary/80">
            ready · {score.completed}/{score.total} steps done
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {headlineStats.map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-container-lowest p-5 tonal-depth">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-primary">
              <MaterialIcon name={s.icon} />
            </div>
            <div className="font-headline text-2xl font-extrabold text-on-surface">{s.value}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl bg-surface-container-lowest p-6 tonal-depth">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">Readiness checklist</h2>
            <span className="font-headline text-sm font-bold text-primary">
              {score.completed}/{score.total} · {score.percent}%
            </span>
          </div>
          <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="academic-gradient h-full rounded-full" style={{ width: `${score.percent}%` }} />
          </div>
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <MaterialIcon
                  name={c.done ? "check_circle" : "radio_button_unchecked"}
                  filled={c.done}
                  className={c.done ? "text-primary" : "text-on-surface-variant/50"}
                />
                <div>
                  <div className="text-sm font-semibold text-on-surface">{c.label}</div>
                  <div className="text-xs text-on-surface-variant">{c.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          {topPresentation && (
            <div className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
              <h2 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
                Continue
              </h2>
              <div className="font-headline font-bold text-on-surface">{topPresentation.title}</div>
              <div className="text-xs text-on-surface-variant">{topPresentation.topic}</div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/presentations/${topPresentation.id}/rehearse`}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary transition hover:opacity-95"
                >
                  <MaterialIcon name="videocam" className="text-sm" filled />
                  Rehearse
                </Link>
                <Link
                  href={`/presentations/${topPresentation.id}`}
                  className="rounded-lg bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-surface-container-high"
                >
                  Open
                </Link>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
            <h2 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Recent rehearsals
            </h2>
            {recent.length > 0 ? (
              <ul className="space-y-3">
                {recent.map((r) => (
                  <li key={r.runId}>
                    <Link
                      href={`/presentations/${r.presentationId}`}
                      className="flex items-center justify-between gap-2 text-sm hover:text-primary"
                    >
                      <span className="min-w-0 truncate text-on-surface">{r.presentationTitle}</span>
                      <span className="shrink-0 text-xs text-on-surface-variant">
                        {formatRunDate(r.runDate, r.startedAt)} · {r.actualDurationMinutes}m · {r.confidenceRating}/5
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-on-surface-variant">
                No rehearsals yet. Open a presentation and start a run.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-xl bg-surface-container-low p-6">
        <h2 className="mb-4 font-headline text-lg font-bold text-on-surface">Quality assurance</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QA_TOOLS.map((tool) => (
            <div key={tool.command} className="rounded-lg bg-surface-container-lowest p-4">
              <div className="flex items-center gap-2">
                <MaterialIcon name="check_circle" filled className="text-sm text-primary" />
                <span className="text-sm font-bold text-on-surface">{tool.label}</span>
              </div>
              <code className="mt-2 block text-xs text-on-surface-variant">{tool.command}</code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
