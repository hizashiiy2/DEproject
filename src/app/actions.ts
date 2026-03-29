"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deletePresentation,
  deleteSection,
  getPresentationById,
  insertPresentation,
  insertRehearsalRun,
  insertSection,
  nextSectionOrder,
  updatePresentation,
} from "@/lib/repository";
import {
  presentationCreateSchema,
  presentationUpdateSchema,
  rehearsalRunCreateSchema,
  sectionCreateSchema,
} from "@/lib/schemas";
import { z } from "zod";

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

const idOnlySchema = z.object({ id: z.string().uuid() });

const sectionDeleteSchema = z.object({
  id: z.string().uuid(),
  presentationId: z.string().uuid(),
});

export async function createPresentation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = presentationCreateSchema.safeParse({
    title: formData.get("title"),
    topic: formData.get("topic"),
    audience: formData.get("audience"),
    targetDurationMinutes: formData.get("targetDurationMinutes"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  insertPresentation({
    id,
    title: data.title,
    topic: data.topic,
    audience: data.audience,
    targetDurationMinutes: data.targetDurationMinutes,
    notes: data.notes,
    createdAt,
  });
  revalidatePath("/");
  revalidatePath("/presentations");
  redirect(`/presentations/${id}`);
}

export async function updatePresentationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = presentationUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    topic: formData.get("topic"),
    audience: formData.get("audience"),
    targetDurationMinutes: formData.get("targetDurationMinutes"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const existing = getPresentationById(data.id);
  if (!existing) {
    return { message: "Presentation not found." };
  }
  updatePresentation({
    id: data.id,
    title: data.title,
    topic: data.topic,
    audience: data.audience,
    targetDurationMinutes: data.targetDurationMinutes,
    notes: data.notes,
  });
  revalidatePath("/");
  revalidatePath("/presentations");
  revalidatePath(`/presentations/${data.id}`);
  redirect(`/presentations/${data.id}`);
}

export async function deletePresentationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = idOnlySchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  deletePresentation(parsed.data.id);
  revalidatePath("/");
  revalidatePath("/presentations");
  redirect("/presentations");
}

/** Single-argument wrapper for `<form action={...}>` (not useActionState). */
export async function deletePresentationForm(formData: FormData) {
  await deletePresentationAction(null, formData);
}

export async function addSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sectionCreateSchema.safeParse({
    presentationId: formData.get("presentationId"),
    title: formData.get("title"),
    targetDurationMinutes: formData.get("targetDurationMinutes"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const order = nextSectionOrder(data.presentationId);
  insertSection({
    id: randomUUID(),
    presentationId: data.presentationId,
    title: data.title,
    targetDurationMinutes: data.targetDurationMinutes,
    order,
  });
  revalidatePath(`/presentations/${data.presentationId}`);
  return null;
}

export async function deleteSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = sectionDeleteSchema.safeParse({
    id: formData.get("id"),
    presentationId: formData.get("presentationId"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  deleteSection(parsed.data.id, parsed.data.presentationId);
  revalidatePath(`/presentations/${parsed.data.presentationId}`);
  return null;
}

export async function deleteSectionForm(formData: FormData) {
  await deleteSectionAction(null, formData);
}

export async function createRehearsalRunAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = rehearsalRunCreateSchema.safeParse({
    presentationId: formData.get("presentationId"),
    runDate: formData.get("runDate"),
    actualDurationMinutes: formData.get("actualDurationMinutes"),
    confidenceRating: formData.get("confidenceRating"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  insertRehearsalRun({
    id: randomUUID(),
    presentationId: data.presentationId,
    runDate: data.runDate,
    actualDurationMinutes: data.actualDurationMinutes,
    confidenceRating: data.confidenceRating,
    notes: data.notes,
  });
  revalidatePath("/");
  revalidatePath(`/presentations/${data.presentationId}`);
  redirect(`/presentations/${data.presentationId}`);
}
