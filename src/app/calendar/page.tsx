import Link from "next/link";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import {
  listPresentationDueDates,
  listRehearsalRunDates,
} from "@/db/repository";
import { EXAM_DATE_ISO } from "@/domain/exam";
import {
  WEEKDAYS,
  isoDate,
  monthLabel,
  monthMatrix,
  monthParam,
  parseMonthParam,
  shiftMonth,
} from "@/domain/calendar";
import { AcademicBreadcrumb } from "@/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/components/MaterialIcon";

type PageProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function CalendarPage({ searchParams }: PageProps) {
  await ensureDynamicDb();
  const sp = await searchParams;
  const monthRaw = typeof sp.month === "string" ? sp.month : undefined;
  const { year, month0 } = parseMonthParam(monthRaw);

  const due = listPresentationDueDates();
  const runDates = listRehearsalRunDates();

  // Bucket data by ISO day for O(1) lookup while rendering the grid.
  const dueByDay = new Map<string, { id: string; title: string }[]>();
  for (const d of due) {
    const list = dueByDay.get(d.dueDate) ?? [];
    list.push({ id: d.id, title: d.title });
    dueByDay.set(d.dueDate, list);
  }
  const runsByDay = new Map<string, number>();
  for (const date of runDates) {
    runsByDay.set(date, (runsByDay.get(date) ?? 0) + 1);
  }

  const weeks = monthMatrix(year, month0);
  const todayIso = isoDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );
  const prev = shiftMonth(year, month0, -1);
  const next = shiftMonth(year, month0, 1);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8">
      <AcademicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Calendar" }]} />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Calendar
          </h1>
          <p className="mt-2 text-on-surface-variant">
            Due dates, rehearsal activity, and the exam — at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?month=${monthParam(prev.year, prev.month0)}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface transition hover:bg-surface-container-high"
            aria-label="Previous month"
          >
            <MaterialIcon name="chevron_left" />
          </Link>
          <span className="min-w-[10rem] text-center font-headline font-bold text-on-surface">
            {monthLabel(year, month0)}
          </span>
          <Link
            href={`/calendar?month=${monthParam(next.year, next.month0)}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface transition hover:bg-surface-container-high"
            aria-label="Next month"
          >
            <MaterialIcon name="chevron_right" />
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Due date
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-tertiary" /> Rehearsal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-error" /> Exam day
        </span>
      </div>

      {/* Grid */}
      <div className="mt-4 overflow-hidden rounded-xl bg-surface-container-lowest tonal-depth">
        <div className="grid grid-cols-7 border-b border-outline-variant/10 bg-surface-container-low">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-on-surface-variant"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flat().map((iso, i) => {
            if (!iso) {
              return <div key={i} className="min-h-[84px] border-b border-r border-outline-variant/5 bg-surface-container-low/30" />;
            }
            const dayNum = Number(iso.slice(8, 10));
            const dueHere = dueByDay.get(iso) ?? [];
            const runs = runsByDay.get(iso) ?? 0;
            const isExam = iso === EXAM_DATE_ISO;
            const isToday = iso === todayIso;
            return (
              <div
                key={i}
                className={`min-h-[84px] border-b border-r border-outline-variant/5 p-1.5 ${
                  isExam ? "bg-error/5" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isToday ? "bg-primary text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {runs > 0 && (
                    <span className="rounded-full bg-tertiary/15 px-1.5 text-[10px] font-bold text-tertiary">
                      {runs}×
                    </span>
                  )}
                </div>
                {isExam && (
                  <div className="mt-1 rounded bg-error px-1.5 py-0.5 text-[10px] font-bold text-on-error">
                    Exam
                  </div>
                )}
                {dueHere.map((p) => (
                  <Link
                    key={p.id}
                    href={`/presentations/${p.id}`}
                    title={p.title}
                    className="mt-1 block truncate rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/25"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming due list */}
      <div className="mt-8">
        <h2 className="mb-3 font-headline text-lg font-bold text-on-surface">Upcoming due dates</h2>
        {due.length > 0 ? (
          <ul className="space-y-2">
            {due.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/presentations/${d.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-4 py-3 tonal-depth transition hover:bg-surface-container"
                >
                  <span className="min-w-0 truncate font-semibold text-on-surface">{d.title}</span>
                  <span className="shrink-0 text-sm text-on-surface-variant">{d.dueDate}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-on-surface-variant">
            No due dates set yet. Add one when creating or editing a presentation.
          </p>
        )}
      </div>
    </div>
  );
}
