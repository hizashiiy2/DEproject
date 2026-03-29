import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const presentationCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  topic: z.string().min(1, "Topic is required").max(200),
  audience: z.string().min(1, "Audience is required").max(200),
  targetDurationMinutes: positiveInt.max(24 * 60),
  notes: z.string().max(5000).optional().default(""),
});

export const presentationUpdateSchema = presentationCreateSchema.extend({
  id: z.string().uuid(),
});

export const sectionCreateSchema = z.object({
  presentationId: z.string().uuid(),
  title: z.string().min(1, "Section title is required").max(200),
  targetDurationMinutes: positiveInt.max(24 * 60),
});

export const rehearsalRunCreateSchema = z.object({
  presentationId: z.string().uuid(),
  runDate: z.string().min(1, "Date is required"),
  actualDurationMinutes: positiveInt.max(24 * 60),
  confidenceRating: z.coerce
    .number()
    .int()
    .min(1, "Confidence must be between 1 and 5")
    .max(5, "Confidence must be between 1 and 5"),
  notes: z.string().max(5000).optional().default(""),
});

export type PresentationCreateInput = z.infer<typeof presentationCreateSchema>;
export type PresentationUpdateInput = z.infer<typeof presentationUpdateSchema>;
export type SectionCreateInput = z.infer<typeof sectionCreateSchema>;
export type RehearsalRunCreateInput = z.infer<typeof rehearsalRunCreateSchema>;
