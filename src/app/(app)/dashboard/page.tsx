import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { AiFeaturePlaceholder } from "@/app/components/AiFeaturePlaceholder";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import { DashboardPresentationSection } from "./dashboard-presentation-section";
import {
  getDashboardStats,
  getTotalPracticeMinutes,
  listPresentationsWithMeta,
  listRecentActivity,
  rehearsalCountsByWeekdayLastDays,
} from "@/lib/repository";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const activityRowIcons = ["mic", "edit_note", "play_circle"] as const;

function confidencePercent(rating: number): number {
  return Math.round((rating / 5) * 100);
}

type PageProps = { searchParams: Promise<{ cadence?: string }> };

export default async function DashboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cadenceDays = sp.cadence === "30" ? 30 : 7;

  const stats = getDashboardStats();
  const totalPracticeMin = getTotalPracticeMinutes();
  const practiceHours = (totalPracticeMin / 60).toFixed(1);
  const avgPct =
    stats.averageConfidence === null ? null : confidencePercent(Math.round(stats.averageConfidence));
  const weekdayCounts = rehearsalCountsByWeekdayLastDays(cadenceDays);
  const maxCount = Math.max(...weekdayCounts, 1);
  const recent = listRecentActivity(5);
  const presentations = listPresentationsWithMeta().slice(0, 6);
  const hasActivity = stats.presentationCount > 0 || stats.runCount > 0;

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <AcademicBreadcrumb
        items={[{ label: "Scholar Dashboard" }, { label: "Overview" }]}
      />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Welcome back
          </h1>
          <p className="mt-1 text-on-surface-variant">
            {hasActivity
              ? "Here is how your rehearsals are trending this week."
              : "Create a presentation and log your first rehearsal to unlock insights."}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-surface-container-low p-1">
          <Link
            href="/dashboard"
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              cadenceDays === 7
                ? "bg-surface-container-lowest tonal-depth"
                : "font-medium text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Last 7 days
          </Link>
          <Link
            href="/dashboard?cadence=30"
            className={`rounded-lg px-4 py-2 text-xs transition ${
              cadenceDays === 30
                ? "bg-surface-container-lowest font-bold tonal-depth"
                : "font-medium text-on-surface-variant hover:text-on-surface"
            }`}
          >
            30 days
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group tonal-depth rounded-xl border-b-2 border-transparent bg-surface-container-lowest p-6 transition-all hover:border-primary">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary transition group-hover:scale-110">
              <MaterialIcon name="analytics" />
            </div>
            {stats.presentationCount > 0 ? (
              <span className="rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-bold text-tertiary">
                Active
              </span>
            ) : null}
          </div>
          <div className="text-sm font-medium text-on-surface-variant">Total Presentations</div>
          <div className="font-headline mt-1 text-3xl font-black text-on-surface">
            {stats.presentationCount}
          </div>
        </div>
        <div className="group tonal-depth rounded-xl border-b-2 border-transparent bg-surface-container-lowest p-6 transition-all hover:border-primary">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary transition group-hover:scale-110">
              <MaterialIcon name="play_circle" />
            </div>
          </div>
          <div className="text-sm font-medium text-on-surface-variant">Rehearsal Runs</div>
          <div className="font-headline mt-1 text-3xl font-black text-on-surface">{stats.runCount}</div>
        </div>
        <div className="group tonal-depth rounded-xl border-b-2 border-transparent bg-surface-container-lowest p-6 transition-all hover:border-primary">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary transition group-hover:scale-110">
              <MaterialIcon name="psychology" />
            </div>
            <div className="-mr-1 flex -space-x-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
          <div className="text-sm font-medium text-on-surface-variant">Average Confidence</div>
          <div className="font-headline mt-1 text-3xl font-black text-on-surface">
            {avgPct === null ? "-" : `${avgPct}%`}
          </div>
        </div>
        <div className="group tonal-depth rounded-xl border-b-2 border-transparent bg-surface-container-lowest p-6 transition-all hover:border-primary">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-lg bg-surface-container-low p-2 text-primary transition group-hover:scale-110">
              <MaterialIcon name="timer" />
            </div>
          </div>
          <div className="text-sm font-medium text-on-surface-variant">Total Practice Time</div>
          <div className="font-headline mt-1 text-3xl font-black text-on-surface">
            {totalPracticeMin === 0 ? "-" : `${practiceHours}h`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col rounded-xl bg-surface-container-low p-8 lg:col-span-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Weekly cadence</h3>
              <p className="text-sm text-on-surface-variant">
                Focus time and rehearsal frequency (last {cadenceDays} days)
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                <span className="h-2.5 w-2.5 rounded-full bg-outline-variant/60" />
                Focus
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                Rehearsal
              </span>
            </div>
          </div>
          <div className="flex min-h-[280px] flex-1 items-end justify-between gap-2 sm:gap-3">
            {weekdayLabels.map((label, i) => {
              const pct = Math.round((weekdayCounts[i]! / maxCount) * 100);
              const rehearsalH = 12 + Math.round((pct / 100) * 168);
              const focusH = Math.max(10, Math.round(rehearsalH * 0.52));
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-[192px] w-full max-w-[3.5rem] items-end justify-center gap-1 px-0.5">
                    <div
                      className="w-1/2 max-w-[1.25rem] rounded-t-lg bg-outline-variant/30"
                      style={{ height: `${focusH}px` }}
                    />
                    <div
                      className="w-1/2 max-w-[1.25rem] rounded-t-lg bg-primary"
                      style={{ height: `${rehearsalH}px` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant opacity-60">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-4">
          <div className="tonal-depth flex-1 rounded-xl bg-surface-container-lowest p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-on-surface">Recent Activity</h3>
              <Link href="/presentations" className="text-xs font-bold text-primary hover:underline">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No runs yet. Log a rehearsal from a presentation.</p>
            ) : (
              <div className="space-y-6">
                {recent.map((item, idx) => {
                  const rowIcon = activityRowIcons[idx % activityRowIcons.length]!;
                  const tone =
                    rowIcon === "mic"
                      ? "text-primary"
                      : rowIcon === "edit_note"
                        ? "text-tertiary"
                        : "text-primary";
                  return (
                    <div key={item.runId} className="flex gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-low">
                        <MaterialIcon name={rowIcon} className={`text-xl ${tone}`} />
                      </div>
                      <div
                        className={
                          idx < recent.length - 1
                            ? "min-w-0 flex-1 border-b border-surface-container pb-4"
                            : "min-w-0 flex-1"
                        }
                      >
                        <Link
                          href={`/presentations/${item.presentationId}`}
                          className="text-sm font-bold text-on-surface hover:text-primary"
                        >
                          {item.presentationTitle}
                        </Link>
                        <div className="text-xs text-on-surface-variant">
                          Rehearsal run · {item.actualDurationMinutes} min
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[10px] font-bold text-on-secondary-container">
                            {confidencePercent(item.confidenceRating)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="tonal-depth rounded-xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <MaterialIcon name="lightbulb" filled className="text-on-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Study tip</span>
              <AiFeaturePlaceholder label="No AI" className="border-on-primary/30 bg-on-primary/15 text-on-primary/90" />
            </div>
            <p className="mb-4 text-sm font-medium leading-relaxed">
              Log notes right after each rehearsal. Patterns in timing and confidence show up on your analytics page
              from real data only.
            </p>
            <Link
              href="/presentations"
              className="block w-full rounded-lg bg-on-primary py-3 text-center text-xs font-bold text-primary transition active:scale-[0.98]"
            >
              Open presentations
            </Link>
          </div>
        </div>
      </div>

      <DashboardPresentationSection presentations={presentations} />
    </div>
  );
}
