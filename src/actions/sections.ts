"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { deleteSection, insertSection, nextSectionOrder } from "@/db/repository";
import { sectionCreateSchema } from "@/domain/validation";
import type { ActionState } from "./types";

const sectionDeleteSchema = z.object({
  id: z.string().uuid(),
  presentationId: z.string().uuid(),
});

export async function addSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDynamicDb();
  const parsed = sectionCreateSchema.safeParse({
    presentationId: formData.get("presentationId"),
    title: formData.get("title"),
    targetDurationMinutes: formData.get("targetDurationMinutes"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  insertSection({
    id: randomUUID(),
    presentationId: data.presentationId,
    title: data.title,
    targetDurationMinutes: data.targetDurationMinutes,
    order: nextSectionOrder(data.presentationId),
  });
  revalidatePath("/");
  revalidatePath(`/presentations/${data.presentationId}`);
  return null;
}

export async function deleteSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDynamicDb();
  const parsed = sectionDeleteSchema.safeParse({
    id: formData.get("id"),
    presentationId: formData.get("presentationId"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  deleteSection(parsed.data.id, parsed.data.presentationId);
  revalidatePath("/");
  revalidatePath(`/presentations/${parsed.data.presentationId}`);
  return null;
}

export async function deleteSectionForm(formData: FormData) {
  await deleteSectionAction(null, formData);
}
