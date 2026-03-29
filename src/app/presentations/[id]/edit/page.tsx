import Link from "next/link";
import { notFound } from "next/navigation";
import { getPresentationById } from "@/lib/repository";
import { PresentationEditForm } from "./edit-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditPresentationPage({ params }: Props) {
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <Link
          href={`/presentations/${presentation.id}`}
          className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          ← Back to presentation
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Edit presentation
        </h1>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <PresentationEditForm presentation={presentation} />
      </div>
    </div>
  );
}
