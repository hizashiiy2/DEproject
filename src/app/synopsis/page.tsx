import Link from "next/link";
import { AcademicBreadcrumb } from "@/components/AcademicBreadcrumb";
import { MaterialIcon } from "@/components/MaterialIcon";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { getSynopsis } from "@/db/repository";
import type { SynopsisInput } from "@/domain/validation";
import { SynopsisForm } from "./synopsis-form";

export const metadata = {
  title: "Synopsis Builder · DEproject",
  description: "Generate and export the 1-page exam synopsis from project data.",
};

const EMPTY_SYNOPSIS: SynopsisInput = {
  title: "",
  description: "",
  topicOne: "",
  topicTwo: "",
  features: "",
  technologies: "",
  githubUrl: "",
  reflection: "",
};

export default async function SynopsisPage() {
  await ensureDynamicDb();
  const saved = getSynopsis();
  const initial: SynopsisInput = saved
    ? {
        title: saved.title,
        description: saved.description,
        topicOne: saved.topicOne,
        topicTwo: saved.topicTwo,
        features: saved.features,
        technologies: saved.technologies,
        githubUrl: saved.githubUrl,
        reflection: saved.reflection,
      }
    : EMPTY_SYNOPSIS;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8">
      <AcademicBreadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Synopsis Builder" }]}
      />

      <header className="mt-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Synopsis Builder
          </h1>
          <p className="mt-2 max-w-2xl text-on-surface-variant">
            Fill in the fields to generate your 1-page exam synopsis. Required fields are
            validated with Zod before saving; the live preview can be copied or exported as
            Markdown.
          </p>
        </div>
        <Link
          href="/synopsis/print"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-surface-container-lowest px-5 py-2.5 text-sm font-bold text-primary tonal-depth transition hover:bg-surface-container"
        >
          <MaterialIcon name="print" className="text-sm" />
          Print view
        </Link>
      </header>

      <div className="mt-10">
        <SynopsisForm initial={initial} />
      </div>
    </div>
  );
}
