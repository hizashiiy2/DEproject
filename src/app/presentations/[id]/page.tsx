import Link from "next/link";
import { notFound } from "next/navigation";
import { compareTargetVsActual } from "@/lib/duration";
import {
  getPresentationById,
  listRehearsalRuns,
  listSections,
} from "@/lib/repository";
import { deletePresentationForm, deleteSectionForm } from "@/app/actions";
import { AddSectionForm } from "./add-section-form";
import { DeleteWithConfirm } from "@/app/components/DeleteWithConfirm";

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

export default async function PresentationDetailPage({ params }: Props) {
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }

  const sections = listSections(presentation.id);
  const runs = listRehearsalRuns(presentation.id);
  const sectionTotal = sections.reduce((s, x) => s + x.targetDurationMinutes, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/presentations"
            className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            ← All presentations
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {presentation.title}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {presentation.topic} · {presentation.audience}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/presentations/${presentation.id}/edit`}
            className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            Edit
          </Link>
          <Link
            href={`/presentations/${presentation.id}/rehearse`}
            className="rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Log rehearsal
          </Link>
          <DeleteWithConfirm
            formAction={deletePresentationForm}
            confirmMessage="Delete this presentation and all sections and runs?"
          >
            <input type="hidden" name="id" value={presentation.id} />
            <button
              type="submit"
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          </DeleteWithConfirm>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Overview
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-stone-500 dark:text-stone-400">Target duration</dt>
              <dd className="font-medium text-stone-900 dark:text-stone-100">
                {presentation.targetDurationMinutes} minutes
              </dd>
            </div>
            <div>
              <dt className="text-stone-500 dark:text-stone-400">Section targets (sum)</dt>
              <dd className="font-medium text-stone-900 dark:text-stone-100">
                {sections.length === 0 ? "—" : `${sectionTotal} minutes`}
              </dd>
            </div>
          </dl>
          {presentation.notes ? (
            <p className="mt-4 text-sm text-stone-700 dark:text-stone-300">{presentation.notes}</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Sections
          </h2>
          {sections.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
              No sections yet. Add one below to break down your timing.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-medium text-stone-900 dark:text-stone-100">{s.title}</span>
                    <span className="ml-2 text-sm text-stone-500 dark:text-stone-400">
                      {s.targetDurationMinutes} min
                    </span>
                  </div>
                  <DeleteWithConfirm
                    formAction={deleteSectionForm}
                    confirmMessage="Remove this section?"
                  >
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="presentationId" value={presentation.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </DeleteWithConfirm>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t border-stone-100 pt-6 dark:border-stone-800">
            <AddSectionForm presentationId={presentation.id} />
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Rehearsal runs
            </h2>
            <Link
              href={`/presentations/${presentation.id}/rehearse`}
              className="text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
            >
              Add run
            </Link>
          </div>
          {runs.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
              No rehearsals logged yet. Practice once and record how it felt.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {runs.map((run) => {
                const cmp = compareTargetVsActual(
                  presentation.targetDurationMinutes,
                  run.actualDurationMinutes,
                );
                return (
                  <li
                    key={run.id}
                    className="rounded-lg border border-stone-100 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-950/50"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {run.runDate}
                      </span>
                      <span className="text-sm text-stone-600 dark:text-stone-400">
                        Confidence {run.confidenceRating}/5
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-stone-800 dark:text-stone-200">
                      Actual{" "}
                      <strong>{run.actualDurationMinutes} min</strong>
                      {" · "}
                      Target <strong>{presentation.targetDurationMinutes} min</strong>
                      {" · "}
                      <span
                        className={
                          cmp.status === "on"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : cmp.status === "under"
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-orange-800 dark:text-orange-400"
                        }
                      >
                        {statusLabel(cmp.status)}
                        {cmp.status !== "on"
                          ? ` (${cmp.deltaMinutes > 0 ? "+" : ""}${cmp.deltaMinutes} min)`
                          : ""}
                      </span>
                    </p>
                    {run.notes ? (
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{run.notes}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
