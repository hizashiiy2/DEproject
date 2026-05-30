import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureDynamicDb } from "@/lib/ensure-dynamic-db";
import { compareTargetVsActual } from "@/lib/duration";
import {
  getPresentationById,
  listRehearsalRuns,
  listSections,
} from "@/lib/repository";
import {
  deletePresentationForm,
  deleteRehearsalRunAction,
  deleteSectionForm,
} from "@/app/actions";
import { AddSectionForm } from "./add-section-form";
import { PresentationStatusForm } from "./presentation-status-form";
import { DeleteWithConfirm } from "@/app/components/DeleteWithConfirm";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/app/components/MaterialIcon";

type Props = { params: Promise<{ id: string }> };

function statusLabel(status: ReturnType<typeof compareTargetVsActual>["status"]) {
  switch (status) {
    case "under":
      return "Under target";
    case "on":
      return "On target";
    case "over":
      return "Over target";
    default:
      return status;
  }
}

function confidencePct(rating: number) {
  return Math.round((rating / 5) * 100);
}

function formatRunDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PresentationDetailPage({ params }: Props) {
  await ensureDynamicDb();
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }

  const sections = listSections(presentation.id);
  const runs = listRehearsalRuns(presentation.id);
  const sectionTotal = sections.reduce((s, x) => s + x.targetDurationMinutes, 0);
  const highStakes = presentation.targetDurationMinutes <= 20;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <AcademicBreadcrumb
        variant="text"
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Presentations", href: "/presentations" },
          { label: presentation.title },
        ]}
      />

      <section className="relative mb-10 flex flex-col gap-8 overflow-hidden rounded-xl bg-surface-container-low p-8 md:flex-row md:items-start">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative z-10 min-w-0 flex-1">
          <h1 className="mb-4 font-headline text-4xl font-extrabold leading-tight tracking-tight text-on-surface md:text-5xl">
            {presentation.title}
          </h1>
          <p className="mb-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
            {presentation.topic} · {presentation.audience}
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/presentations/${presentation.id}/rehearse`}
                className="academic-gradient flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition hover:scale-[1.02]"
              >
                <MaterialIcon name="play_circle" className="text-on-primary" />
                Start rehearsal
              </Link>
              <Link
                href={`/presentations/${presentation.id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-surface-container-lowest px-6 py-3 text-sm font-bold text-primary transition hover:bg-surface-container"
              >
                <MaterialIcon name="edit" />
                Edit details
              </Link>
              <div className="flex flex-1 flex-wrap items-center justify-start gap-2 sm:justify-end">
                <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-surface">
                  {presentation.status}
                </span>
                <span className="rounded-full bg-tertiary-fixed px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-tertiary-fixed-variant">
                  {highStakes ? "High stakes" : "Academic"}
                </span>
                <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wider text-on-secondary-container">
                  {presentation.targetDurationMinutes} min
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/10 pt-4">
              <PresentationStatusForm presentationId={presentation.id} status={presentation.status} />
              <DeleteWithConfirm
                formAction={deletePresentationForm}
                confirmMessage="Delete this presentation and all sections and runs?"
              >
                <input type="hidden" name="id" value={presentation.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg border border-error/25 px-3 py-2 text-xs font-bold uppercase tracking-wide text-error transition hover:bg-error-container/30"
                >
                  <MaterialIcon name="delete" className="text-base" />
                  Delete presentation
                </button>
              </DeleteWithConfirm>
            </div>
          </div>
        </div>
      </section>

      {presentation.notes ? (
        <p className="mb-10 text-sm leading-relaxed text-on-surface-variant">{presentation.notes}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 font-headline text-xl font-bold text-on-surface">
                  <MaterialIcon name="list_alt" className="text-primary" />
                  Presentation outline
                </h2>
                <Link
                  href="#add-section"
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <MaterialIcon name="add_circle" className="text-lg" />
                  Add section
                </Link>
              </div>
              {sections.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  No sections yet. Add one below to break down timing.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-outline-variant/10 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                        <th className="w-10 pb-4">#</th>
                        <th className="pb-4">Section title</th>
                        <th className="pb-4 text-right">Planned duration</th>
                        <th className="pb-4 text-right"> </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/5">
                      {sections.map((s, idx) => (
                        <tr
                          key={s.id}
                          className="transition-colors hover:bg-surface-container-low/50"
                        >
                          <td className="py-4 font-medium text-on-surface-variant">
                            {String(idx + 1).padStart(2, "0")}
                          </td>
                          <td className="py-4 font-semibold text-on-surface">{s.title}</td>
                          <td className="py-4 text-right text-sm font-medium text-on-surface">
                            {s.targetDurationMinutes} min
                          </td>
                          <td className="py-4 text-right">
                            <DeleteWithConfirm
                              formAction={deleteSectionForm}
                              confirmMessage="Remove this section?"
                            >
                              <input type="hidden" name="id" value={s.id} />
                              <input type="hidden" name="presentationId" value={presentation.id} />
                              <button
                                type="submit"
                                className="text-xs font-semibold text-error hover:underline"
                              >
                                Remove
                              </button>
                            </DeleteWithConfirm>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-surface-container-low pt-4 text-sm text-on-surface-variant">
                    <span>Section targets (sum)</span>
                    <span className="font-semibold text-on-surface">
                      {sections.length === 0 ? "-" : `${sectionTotal} min`}
                    </span>
                  </div>
                </div>
              )}
              <div id="add-section" className="scroll-mt-28 mt-8 border-t border-surface-container-low pt-6">
                <AddSectionForm presentationId={presentation.id} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div id="history" className="scroll-mt-28 rounded-xl bg-surface-container-low p-6">
            <h2 className="mb-6 flex items-center gap-2 font-headline text-xl font-bold text-on-surface">
              <MaterialIcon name="history" className="text-tertiary" />
              Recent history
            </h2>
            {runs.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                No rehearsals logged yet. Start a run and capture how it felt.
              </p>
            ) : (
              <div className="space-y-4">
                {runs.map((run, idx) => {
                  const cmp = compareTargetVsActual(
                    presentation.targetDurationMinutes,
                    run.actualDurationMinutes,
                  );
                  const pct = confidencePct(run.confidenceRating);
                  const strong = idx === 0;
                  return (
                    <div
                      key={run.id}
                      className={`rounded-lg bg-surface-container-lowest p-4 shadow-sm ${
                        strong ? "border-l-4 border-primary" : "border-l-4 border-outline-variant/30"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface">{formatRunDate(run.runDate)}</p>
                          <p className="text-xs text-on-surface-variant">
                            {run.actualDurationMinutes} min total · target {presentation.targetDurationMinutes}{" "}
                            min
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            className={`text-xs font-bold ${strong ? "text-primary" : "text-on-surface-variant"}`}
                          >
                            Confidence
                          </p>
                          <p className="font-headline text-lg font-black text-on-surface">{pct}%</p>
                        </div>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container">
                        <div
                          className={`h-full ${strong ? "bg-primary" : "bg-outline"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-on-surface-variant">
                        {statusLabel(cmp.status)}
                        {cmp.status !== "on"
                          ? ` (${cmp.deltaMinutes > 0 ? "+" : ""}${cmp.deltaMinutes} min)`
                          : ""}
                      </p>
                      {run.notes ? (
                        <p className="mt-2 text-xs italic text-on-surface-variant">{run.notes}</p>
                      ) : null}
                      <DeleteWithConfirm
                        formAction={deleteRehearsalRunAction}
                        confirmMessage="Remove this rehearsal log from your history?"
                      >
                        <input type="hidden" name="id" value={run.id} />
                        <input type="hidden" name="presentationId" value={presentation.id} />
                        <button
                          type="submit"
                          className="mt-3 text-xs font-semibold text-error hover:underline"
                        >
                          Remove log
                        </button>
                      </DeleteWithConfirm>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href="#history"
                className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-outline-variant py-3 text-sm font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary"
              >
                View all attempts
              </Link>
              <Link
                href={`/presentations/${presentation.id}/rehearse`}
                className="flex w-full items-center justify-center rounded-xl bg-surface-container-lowest py-3 text-sm font-semibold text-primary transition hover:bg-surface-container"
              >
                Log rehearsal
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-tertiary-fixed p-6">
            <div className="relative z-10">
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-on-tertiary-fixed">
                Academic insight
              </h3>
              <p className="text-sm font-medium leading-relaxed text-on-tertiary-fixed-variant">
                Your pacing in longer sections improves when you log notes after each run. Keep focusing on
                conclusion transitions.
              </p>
            </div>
            <MaterialIcon
              name="lightbulb"
              filled
              className="pointer-events-none absolute -bottom-4 -right-4 rotate-12 text-8xl opacity-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
