import Link from "next/link";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  QA_TOOLS,
  computeReadiness,
  readinessScore,
} from "@/lib/readiness";
import {
  getDashboardStats,
  getSynopsis,
  getTotalSectionCount,
} from "@/lib/repository";

export const metadata = {
  title: "Project Readiness · DEproject",
  description: "Track exam deliverables and quality-assurance tooling at a glance.",
};

export default function ReadinessPage() {
  const synopsis = getSynopsis();
  const stats = getDashboardStats();
  const sectionCount = getTotalSectionCount();

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

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
      <AcademicBreadcrumb
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Project Readiness" }]}
      />

      <header className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Project Readiness
          </h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            A checklist of exam deliverables (tracked from your project data) and the
            quality-assurance tooling configured for this prototype.
          </p>
        </div>
        <div className="tonal-depth flex shrink-0 flex-col items-center rounded-2xl bg-surface-container-lowest px-8 py-5">
          <div className="font-headline text-4xl font-black text-primary">
            {score.percent}%
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {score.completed} / {score.total} ready
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="font-headline text-lg font-bold text-on-surface">
          Exam deliverables
        </h2>
        <ul className="mt-4 space-y-3">
          {checks.map((check) => (
            <li
              key={check.id}
              className="flex items-start gap-4 rounded-xl bg-surface-container-low p-4"
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  check.done
                    ? "bg-tertiary/15 text-tertiary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                <MaterialIcon
                  name={check.done ? "reviews" : "schedule"}
                  filled={check.done}
                  className="text-base"
                />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-on-surface">{check.label}</div>
                <div className="text-xs text-on-surface-variant">{check.detail}</div>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                  check.done
                    ? "bg-tertiary/10 text-tertiary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {check.done ? "Ready" : "To do"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/synopsis"
            className="text-sm font-bold text-primary hover:underline"
          >
            Open Synopsis Builder →
          </Link>
          <Link
            href="/exam"
            className="text-sm font-bold text-primary hover:underline"
          >
            Open Exam Mode →
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-headline text-lg font-bold text-on-surface">
          Quality assurance tooling
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          These scripts are configured in <code className="text-xs">package.json</code>.
          Run them from a terminal — the dashboard does not execute them.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QA_TOOLS.map((tool) => (
            <div
              key={tool.label}
              className="tonal-depth rounded-xl bg-surface-container-lowest p-5"
            >
              <div className="flex items-center gap-2">
                <MaterialIcon name="reviews" filled className="text-base text-tertiary" />
                <span className="text-sm font-bold text-on-surface">{tool.label}</span>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">{tool.description}</p>
              <code className="mt-3 block rounded-lg bg-surface-container px-3 py-2 font-mono text-xs text-primary">
                npm run {scriptFor(tool.command)}
              </code>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Maps a tool command to its npm script alias for display. */
function scriptFor(command: string): string {
  if (command.startsWith("eslint")) return "lint";
  if (command.startsWith("tsc")) return "typecheck";
  if (command.startsWith("vitest")) return "test";
  if (command.startsWith("next build")) return "build";
  return command;
}
