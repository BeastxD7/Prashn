import { Difficulty, QuestionType } from "@prisma/client";
import z from "zod";

export const generateQuizByTextSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(300),  
  content: z.string().min(5).max(7000),
  preferences: z.object({
    numOfQuestions: z.number().min(1).max(30).optional().default(5),
    difficulty: z.string().transform(val => val.toLowerCase()).pipe(z.enum(["easy", "medium", "hard"])).optional().default("medium"),
    questionTypes: z.array(z.string().pipe(z.enum(QuestionType))).optional().default([QuestionType.MCQ]),
  }).optional(),
});

export const generateQuizByPdfSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(300),
  questionTypes: z
    .preprocess((val) => {
      if (Array.isArray(val)) {
        return val;
      }
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (!trimmed) {
          return undefined;
        }
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch (err) {
          // fall back to comma-separated parsing
          return trimmed
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
        return [trimmed];
      }
      return val;
    }, z.array(z.nativeEnum(QuestionType)).optional())
    .default([QuestionType.MCQ]),
  difficulty: z
    .preprocess((val) => {
      if (Array.isArray(val)) {
        return val.map((item) => String(item).toUpperCase());
      }
      if (typeof val === "string") {
        return val.toUpperCase();
      }
      return val;
    }, z
      .union([z.nativeEnum(Difficulty), z.array(z.nativeEnum(Difficulty))])
      .optional())
    .default(Difficulty.MEDIUM),
  numOfQuestions: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const parsed = Number(val);
        return Number.isNaN(parsed) ? val : parsed;
      }
      return val;
    }, z.number().min(1).max(30).optional())
    .default(5),
});