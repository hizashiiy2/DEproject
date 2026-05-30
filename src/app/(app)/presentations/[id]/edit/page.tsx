import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureDynamicDb } from "@/lib/ensure-dynamic-db";
import { getPresentationById } from "@/lib/repository";
import { PresentationEditForm } from "./edit-form";
import { AcademicBreadcrumb } from "@/app/components/AcademicBreadcrumb";

type Props = { params: Promise<{ id: string }> };

export default async function EditPresentationPage({ params }: Props) {
  await ensureDynamicDb();
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <AcademicBreadcrumb
        items={[
          { label: "Presentations", href: "/presentations" },
          { label: presentation.title, href: `/presentations/${presentation.id}` },
          { label: "Edit" },
        ]}
      />
      <div className="mt-6">
        <Link
          href={`/presentations/${presentation.id}`}
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← Back to presentation
        </Link>
        <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          Edit presentation
        </h1>
      </div>
      <div className="tonal-depth mt-8 rounded-xl bg-surface-container-lowest p-8">
        <PresentationEditForm presentation={presentation} />
      </div>
    </div>
  );
}
