import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";
import { ExamModeClient } from "./exam-mode-client";

export const metadata = {
  title: "Exam Mode · DEproject",
  description: "Rehearse against the DE oral exam structure with phased timers.",
};

export default function ExamModePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
      <AcademicBreadcrumb
        items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exam Mode" }]}
      />

      <header className="mt-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Exam Mode
        </h1>
        <p className="mt-2 text-on-surface-variant">
          A timed rehearsal that follows the real DE exam: 10 min presentation, 5 min
          dialogue, 5 min evaluation.
        </p>
      </header>

      <div className="mt-10">
        <ExamModeClient />
      </div>
    </div>
  );
}
