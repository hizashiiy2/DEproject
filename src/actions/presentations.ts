"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import {
  deletePresentation,
  getPresentationById,
  insertPresentation,
  updatePresentation,
} from "@/db/repository";
import {
  presentationCreateSchema,
  presentationStatusUpdateSchema,
  presentationUpdateSchema,
} from "@/domain/validation";
import type { ActionState } from "./types";

const idOnlySchema = z.object({ id: z.string().uuid() });

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
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const id = randomUUID();
  insertPresentation({
    id,
    title: data.title,
    topic: data.topic,
    audience: data.audience,
    targetDurationMinutes: data.targetDurationMinutes,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    status: data.status,
    dueDate: data.dueDate,
  });
  revalidatePath("/");
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
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  if (!getPresentationById(data.id)) {
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
    dueDate: data.dueDate,
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
  await ensureDynamicDb();
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
    dueDate: existing.dueDate,
  });
  revalidatePath("/");
  revalidatePath("/presentations");
  revalidatePath(`/presentations/${id}`);
}
