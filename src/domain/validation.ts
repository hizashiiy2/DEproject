import { z } from "zod";

const positiveInt = z.coerce.number().int().positive();

export const presentationStatusSchema = z.enum(["draft", "active", "completed"]);

export const presentationCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  topic: z.string().min(1, "Topic is required").max(200),
  audience: z.string().min(1, "Audience is required").max(200),
  targetDurationMinutes: positiveInt.max(24 * 60),
  notes: z.string().max(5000).optional().default(""),
  status: presentationStatusSchema.optional().default("active"),
  dueDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date"), z.literal("")])
    .optional()
    .default(""),
});

export const presentationUpdateSchema = presentationCreateSchema.extend({
  id: z.string().uuid(),
});

export const presentationStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: presentationStatusSchema,
});

export const rehearsalRunDeleteSchema = z.object({
  id: z.string().uuid(),
  presentationId: z.string().uuid(),
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
  sessionType: z.string().max(80).optional().default(""),
});

/**
 * Validates the 1-page exam synopsis before it can be generated/exported.
 * Empty optional URLs are allowed so the form can be saved as a draft.
 */
export const synopsisSchema = z.object({
  title: z.string().min(1, "Project title is required").max(200),
  description: z
    .string()
    .min(20, "Description should be at least 20 characters")
    .max(2000),
  topicOne: z.string().min(1, "Choose your first course topic").max(120),
  topicTwo: z.string().min(1, "Choose your second course topic").max(120),
  features: z.string().min(1, "List your main prototype features").max(2000),
  technologies: z.string().min(1, "List the technologies used").max(1000),
  githubUrl: z
    .union([z.string().url("Enter a valid URL"), z.literal("")])
    .optional()
    .default(""),
  reflection: z.string().max(2000).optional().default(""),
});

export type PresentationCreateInput = z.infer<typeof presentationCreateSchema>;
export type PresentationUpdateInput = z.infer<typeof presentationUpdateSchema>;
export type SectionCreateInput = z.infer<typeof sectionCreateSchema>;
export type RehearsalRunCreateInput = z.infer<typeof rehearsalRunCreateSchema>;
export type SynopsisInput = z.infer<typeof synopsisSchema>;
