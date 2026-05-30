import Link from "next/link";
import { AcademicBreadcrumb } from "@/components/AcademicBreadcrumb";
import { PresentationNewForm } from "./presentation-form";

export default function NewPresentationPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <AcademicBreadcrumb
        items={[
          { label: "Presentations", href: "/presentations" },
          { label: "New" },
        ]}
      />
      <div className="mt-6">
        <Link href="/presentations" className="text-sm text-on-surface-variant hover:text-primary">
          ← All presentations
        </Link>
        <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          New presentation
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Set a target length and audience. You will add timed sections on the next screen.
        </p>
      </div>
      <div className="tonal-depth mt-8 rounded-xl bg-surface-container-lowest p-8">
        <PresentationNewForm />
      </div>
    </div>
  );
}
