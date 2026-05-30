"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureDynamicDb } from "@/lib/ensure-dynamic-db";
import {
  deletePresentation,
  deleteRehearsalRun,
  deleteSection,
  getPresentationById,
  insertPresentation,
  insertRehearsalRun,
  insertSection,
  nextSectionOrder,
  updatePresentation,
  upsertSynopsis,
} from "@/lib/repository";
import {
  presentationCreateSchema,
  presentationStatusUpdateSchema,
  presentationUpdateSchema,
  rehearsalRunCreateSchema,
  rehearsalRunDeleteSchema,
  sectionCreateSchema,
  synopsisSchema,
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
  await ensureDynamicDb();
  const parsed = presentationCreateSchema.safeParse({
    title: formData.get("title"),
    topic: formData.get("topic"),
    audience: formData.get("audience"),
    targetDurationMinutes: formData.get("targetDurationMinutes"),
    notes: formData.get("notes") ?? "",
    status: formData.get("status") ?? "active",
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
    status: data.status,
  });
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/presentations");
  redirect(`/presentations/${id}`);
}

export async function updatePresentationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDynamicDb();
  const parsed = presentationUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    topic: formData.get("topic"),
    audience: formData.get("audience"),
    targetDurationMinutes: formData.get("targetDurationMinutes"),
    notes: formData.get("notes") ?? "",
    status: formData.get("status") ?? "active",
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
    status: data.status,
  });
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/presentations");
  revalidatePath(`/presentations/${data.id}`);
  redirect(`/presentations/${data.id}`);
}

export async function deletePresentationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDynamicDb();
  const parsed = idOnlySchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  deletePresentation(parsed.data.id);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
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
  const order = nextSectionOrder(data.presentationId);
  insertSection({
    id: randomUUID(),
    presentationId: data.presentationId,
    title: data.title,
    targetDurationMinutes: data.targetDurationMinutes,
    order,
  });
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
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
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath(`/presentations/${parsed.data.presentationId}`);
  return null;
}

export async function deleteSectionForm(formData: FormData) {
  await deleteSectionAction(null, formData);
}

export async function updatePresentationStatusAction(formData: FormData) {
  await ensureDynamicDb();
  const parsed = presentationStatusUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return;
  }
  const { id, status } = parsed.data;
  const existing = getPresentationById(id);
  if (!existing) {
    return;
  }
  updatePresentation({
    id: existing.id,
    title: existing.title,
    topic: existing.topic,
    audience: existing.audience,
    targetDurationMinutes: existing.targetDurationMinutes,
    notes: existing.notes,
    status,
  });
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath("/presentations");
  revalidatePath(`/presentations/${id}`);
}

export async function deleteRehearsalRunAction(formData: FormData) {
  await ensureDynamicDb();
  const parsed = rehearsalRunDeleteSchema.safeParse({
    id: formData.get("id"),
    presentationId: formData.get("presentationId"),
  });
  if (!parsed.success) {
    return;
  }
  deleteRehearsalRun(parsed.data.id, parsed.data.presentationId);
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath(`/presentations/${parsed.data.presentationId}`);
}

export async function saveSynopsisAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDynamicDb();
  const parsed = synopsisSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    topicOne: formData.get("topicOne"),
    topicTwo: formData.get("topicTwo"),
    features: formData.get("features"),
    technologies: formData.get("technologies"),
    githubUrl: formData.get("githubUrl") ?? "",
    reflection: formData.get("reflection") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  upsertSynopsis({
    title: data.title,
    description: data.description,
    topicOne: data.topicOne,
    topicTwo: data.topicTwo,
    features: data.features,
    technologies: data.technologies,
    githubUrl: data.githubUrl,
    reflection: data.reflection,
  });
  revalidatePath("/synopsis");
  revalidatePath("/readiness");
  return { message: "Synopsis saved." };
}

export async function createRehearsalRunAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await ensureDynamicDb();
  const parsed = rehearsalRunCreateSchema.safeParse({
    presentationId: formData.get("presentationId"),
    runDate: formData.get("runDate"),
    actualDurationMinutes: formData.get("actualDurationMinutes"),
    confidenceRating: formData.get("confidenceRating"),
    notes: formData.get("notes") ?? "",
    sessionType: formData.get("sessionType") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const session = data.sessionType.trim();
  const notesBody = data.notes.trim();
  const notes =
    session.length > 0
      ? `[${session}]${notesBody.length > 0 ? ` ${notesBody}` : ""}`
      : data.notes;
  insertRehearsalRun({
    id: randomUUID(),
    presentationId: data.presentationId,
    runDate: data.runDate,
    actualDurationMinutes: data.actualDurationMinutes,
    confidenceRating: data.confidenceRating,
    notes,
  });
  revalidatePath("/dashboard");
  revalidatePath("/analytics");
  revalidatePath(`/presentations/${data.presentationId}`);
  redirect(`/presentations/${data.presentationId}`);
}
