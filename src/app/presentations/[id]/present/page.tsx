import { notFound } from "next/navigation";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { getPresentationById, listSections } from "@/db/repository";
import { PresentClient } from "./present-client";

type Props = { params: Promise<{ id: string }> };

export default async function PresentPage({ params }: Props) {
  await ensureDynamicDb();
  const { id } = await params;
  const presentation = getPresentationById(id);
  if (!presentation) {
    notFound();
  }
  const sections = listSections(presentation.id);
  return (
    <PresentClient
      presentationId={presentation.id}
      title={presentation.title}
      targetDurationMinutes={presentation.targetDurationMinutes}
      sections={sections.map((s) => ({
        title: s.title,
        targetDurationMinutes: s.targetDurationMinutes,
      }))}
    />
  );
}
