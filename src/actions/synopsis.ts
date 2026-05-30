"use server";

import { revalidatePath } from "next/cache";
import { ensureDynamicDb } from "@/db/ensure-dynamic";
import { upsertSynopsis } from "@/db/repository";
import { synopsisSchema } from "@/domain/validation";
import type { ActionState } from "./types";

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
  revalidatePath("/");
  revalidatePath("/synopsis");
  return { message: "Synopsis saved." };
}
