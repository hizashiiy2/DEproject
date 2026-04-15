import Link from "next/link";
import { notFound } from "next/navigation";
import { getPresentationById } from "@/lib/repository";
import { RehearseForm } from "./rehearse-form";
import { MaterialIcon } from "@/app/components/MaterialIcon";

type Props = { params: Promise<{ id: string }> };

export default async function RehearsePage({ params }: Props) {
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-surface p-6 md:p-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-tertiary/5 blur-[120px]" />
      </div>
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl bg-surface-container-lowest tonal-shadow">
        <div className="bg-surface-container-highest/30 px-6 py-3 sm:px-8">
          <nav
            className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-on-surface-variant"
            aria-label="Breadcrumb"
          >
            <Link href="/presentations" className="hover:text-primary">
              Presentations
            </Link>
            <MaterialIcon name="chevron_right" className="text-[12px]" />
            <Link href={`/presentations/${presentation.id}`} className="max-w-[12rem] truncate hover:text-primary sm:max-w-none">
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
              Record a take in the browser, review quick suggestions, then log how it felt. Everything stays on your
              device until you save.
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              {presentation.title} · target {presentation.targetDurationMinutes} min
            </p>
          </header>
          <RehearseForm presentationId={presentation.id} targetDurationMinutes={presentation.targetDurationMinutes} />
        </div>
        <div className="flex items-start gap-4 bg-tertiary-fixed/30 p-6">
          <MaterialIcon name="lightbulb" filled className="shrink-0 text-tertiary" />
          <p className="text-sm leading-snug text-on-tertiary-fixed-variant">
            <span className="font-bold">Academic insight:</span> Students who log notes immediately after
            practicing show a <span className="font-bold">14% higher retention rate</span> of key talking points.
          </p>
        </div>
      </div>
    </main>
  );
}
