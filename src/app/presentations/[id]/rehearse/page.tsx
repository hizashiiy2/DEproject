import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { getPresentationById, listRehearsalRuns, listSections } from "@/db/repository";
import { RehearseClient } from "./rehearse-client";
import { MaterialIcon } from "@/components/MaterialIcon";

type Props = { params: Promise<{ id: string }> };

export default async function RehearsePage({ params }: Props) {
  await ensureDynamicDb();
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }

  const sections = listSections(presentation.id);
  const history = listRehearsalRuns(presentation.id);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-surface p-6 md:p-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-xl bg-surface-container-lowest tonal-shadow">
        <div className="bg-surface-container-highest/30 px-6 py-3 sm:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant"
            aria-label="Breadcrumb"
          >
            <Link href="/presentations" className="hover:text-primary">
              Presentations
            </Link>
            <MaterialIcon name="chevron_right" className="text-[12px]" />
            <Link
              href={`/presentations/${presentation.id}`}
              className="max-w-[12rem] truncate hover:text-primary sm:max-w-none"
            >
              {presentation.title}
            </Link>
            <MaterialIcon name="chevron_right" className="text-[12px]" />
            <span className="text-primary">Log session</span>
          </nav>
        </div>
        <div className="p-8 md:p-12">
          <header className="mb-10">
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
              Rehearsal session
            </h1>
            <p className="text-lg leading-relaxed text-on-surface-variant">
              Time each section, record camera and sound, and jot timestamped notes as you go - then
              log how it felt.
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {presentation.title} - target {presentation.targetDurationMinutes} min
            </p>
          </header>
          <RehearseClient
            presentationId={presentation.id}
            title={presentation.title}
            targetDurationMinutes={presentation.targetDurationMinutes}
            sections={sections.map((section) => ({
              title: section.title,
              targetDurationMinutes: section.targetDurationMinutes,
            }))}
            history={history.map((run) => ({
              id: run.id,
              runDate: run.runDate,
              startedAt: run.startedAt,
              actualDurationMinutes: run.actualDurationMinutes,
              confidenceRating: run.confidenceRating,
              notes: run.notes,
            }))}
          />
        </div>
        <div className="flex items-start gap-4 bg-tertiary-fixed/30 p-6">
          <MaterialIcon name="lightbulb" filled className="shrink-0 text-tertiary" />
          <p className="text-sm leading-snug text-on-tertiary-fixed-variant">
            <span className="font-bold">Academic insight:</span> Students who log notes immediately
            after practicing retain more key talking points for the next run.
          </p>
        </div>
      </div>
    </main>
  );
}
