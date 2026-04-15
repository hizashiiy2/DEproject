import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { AiFeaturePlaceholder } from "@/app/components/AiFeaturePlaceholder";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  getDashboardStats,
  getTotalPracticeMinutes,
  listGlobalConfidenceTrendLastN,
  rehearsalCountsByWeekdayLastDays,
} from "@/lib/repository";

export default function AnalyticsPage() {
  const stats = getDashboardStats();
  const trend = listGlobalConfidenceTrendLastN(10);
  const maxTrend = Math.max(...trend, 1);
  const totalMin = getTotalPracticeMinutes();
  const weekdayCounts = rehearsalCountsByWeekdayLastDays(365);
  const maxHeat = Math.max(...weekdayCounts, 1);

  const avgConfidencePct =
    stats.averageConfidence === null
      ? null
      : Math.round((stats.averageConfidence / 5) * 100);

  return (
    <div className="min-h-screen px-6 pb-12 pt-6 lg:px-10 lg:pt-8">
      <AcademicBreadcrumb
        variant="pill"
        pillSeparator="chevron"
        className="mb-8 self-start"
        items={[
          { label: "DEproject", href: "/" },
          { label: "Academic Analytics" },
          { label: "Performance Trends" },
        ]}
      />

      <div className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface lg:text-5xl">
            Performance analytics
          </h1>
          <p className="max-w-xl text-lg text-on-surface-variant">
            How often you rehearse and how confidence moves over your last recorded runs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/export/rehearsals"
            download
            className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container"
          >
            <MaterialIcon name="download" className="text-sm" />
            Export CSV
          </a>
          <div
            className="flex cursor-not-allowed flex-wrap items-center gap-2 rounded-xl bg-surface-container-high/50 px-6 py-2.5 text-sm font-bold text-on-surface-variant opacity-60"
            title="AI-generated insights are out of scope for this project."
          >
            <MaterialIcon name="auto_awesome" className="text-sm" />
            Generate insights
            <AiFeaturePlaceholder label="AI off" className="text-[9px]" />
          </div>
          <Link
            href="/dashboard"
            className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-container-low"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-xl bg-surface-container-lowest p-8 md:col-span-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative z-10 mb-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Performance trends</h3>
              <p className="text-sm text-on-surface-variant">Confidence score across recent rehearsals</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5">
              <span className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-on-surface-variant">Confidence</span>
            </div>
          </div>
          {trend.length === 0 ? (
            <p className="relative z-10 text-sm text-on-surface-variant">
              Log a few rehearsals to unlock this chart.
            </p>
          ) : (
            <div className="relative z-10 flex flex-grow items-end gap-2 sm:gap-3">
              {trend.map((v, i) => {
                const hPx = 28 + Math.round((v / maxTrend) * 160);
                const opacity = 0.35 + (0.65 * (i + 1)) / trend.length;
                return (
                  <div
                    key={`${i}-${v}`}
                    className="flex-1 rounded-t-sm bg-primary"
                    style={{
                      height: `${hPx}px`,
                      opacity: Math.min(1, opacity),
                    }}
                  />
                );
              })}
            </div>
          )}
          <div className="relative z-10 mt-4 flex justify-between px-1">
            <span className="text-[10px] font-bold text-on-surface-variant">Earlier</span>
            <span className="text-[10px] font-bold text-on-surface-variant">Current</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:col-span-4">
          <div className="flex flex-col justify-between rounded-xl bg-primary p-6 text-on-primary">
            <div className="flex items-start justify-between">
              <MaterialIcon name="bolt" className="text-3xl" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Consistency</span>
            </div>
            <div className="mt-8">
              <div className="mb-1 text-4xl font-extrabold">{stats.runCount}</div>
              <p className="text-sm font-medium leading-tight opacity-90">
                Total rehearsal runs logged across all presentations.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-xl bg-tertiary-fixed p-6 text-on-tertiary-fixed">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <MaterialIcon name="psychology" className="text-3xl" />
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Summary</span>
                <AiFeaturePlaceholder label="Not AI" className="border-on-tertiary-fixed-variant/30 bg-on-tertiary-fixed-variant/10 text-on-tertiary-fixed-variant" />
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-1 text-lg font-bold leading-tight">
                {avgConfidencePct === null ? "Log a rehearsal" : `Avg ${avgConfidencePct}% confidence`}
              </div>
              <p className="text-xs opacity-90">
                Simple average from your ratings (1–5), shown as a 0–100% score. No models or predictions.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low p-8 md:col-span-7">
          <h3 className="mb-8 font-headline text-xl font-bold text-on-surface">Practice by weekday</h3>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="pb-2 text-center text-[10px] font-bold uppercase text-outline">
                {d}
              </div>
            ))}
            {weekdayCounts.map((c, i) => {
              const level = Math.min(3, Math.ceil((c / maxHeat) * 3));
              const tones = ["bg-primary/10", "bg-primary/40", "bg-primary/80", "bg-primary"] as const;
              return (
                <div
                  key={`cell-${i}`}
                  className={`aspect-square rounded-md ${tones[level]}`}
                  title={`${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}: ${c} runs`}
                />
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <span className="text-[10px] font-bold uppercase text-outline">Low</span>
            <div className="flex gap-1">
              <div className="h-3 w-3 rounded-sm bg-primary/10" />
              <div className="h-3 w-3 rounded-sm bg-primary/40" />
              <div className="h-3 w-3 rounded-sm bg-primary/70" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase text-outline">High</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-surface-container-high/20 p-8 md:col-span-5">
          <div>
            <h3 className="mb-1 font-headline text-xl font-bold text-on-surface">Time invested</h3>
            <p className="mb-6 text-sm text-on-surface-variant">Total minutes across all runs</p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-5xl font-extrabold text-primary">{totalMin}</span>
              <span className="text-on-surface-variant">minutes</span>
            </div>
          </div>
          <div className="mt-8 rounded-xl bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                <MaterialIcon name="timer" className="text-sm" />
              </div>
              <p className="text-[11px] font-medium text-on-surface-variant">
                Compare each run to your presentation target on the detail page to see under vs over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: "present_to_all", label: "Presentations", value: String(stats.presentationCount) },
          { icon: "timer", label: "Practice minutes", value: String(totalMin) },
          { icon: "reviews", label: "Runs logged", value: String(stats.runCount) },
          {
            icon: "trending_up",
            label: "Avg confidence",
            value: avgConfidencePct === null ? "-" : `${avgConfidencePct}%`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="group rounded-xl bg-surface-container-lowest p-6 transition hover:shadow-xl hover:shadow-on-surface/5"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container transition-transform group-hover:-translate-y-1">
              <MaterialIcon name={card.icon} />
            </div>
            <div className="font-headline text-2xl font-extrabold text-on-surface">{card.value}</div>
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
