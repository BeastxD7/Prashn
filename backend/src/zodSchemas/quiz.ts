import z from "zod";

export const QuizbyTextSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(300),  
  content: z.string().min(5).max(7000),
  preferences: z.object({
    numOfQuestions: z.number().min(1).max(20).optional().default(5),
    difficulty: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["easy", "medium", "hard"])).optional().default("medium"),
    questionTypes: z.array(z.string().transform(val => val.toLowerCase()).pipe(z.enum(["multiple-choice", "true-false", "short-answer"]))).optional().default(["multiple-choice"]),
  }).optional(),
});

