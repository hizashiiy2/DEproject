"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { deleteRehearsalRun, insertRehearsalRun } from "@/db/repository";
import {
  rehearsalRunCreateSchema,
  rehearsalRunDeleteSchema,
} from "@/domain/validation";
import type { ActionState } from "./types";

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
  revalidatePath("/");
  revalidatePath(`/presentations/${data.presentationId}`);
  redirect(`/presentations/${data.presentationId}`);
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
  revalidatePath("/");
  revalidatePath(`/presentations/${parsed.data.presentationId}`);
}
