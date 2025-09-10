import z from "zod";

export const GenerateQuizByVideoSchema = z.object({
  videoUrl: z.string().url(),
  numQuestions: z.number().min(1).max(20).optional().default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  topic: z.string().optional().default("General"),
});