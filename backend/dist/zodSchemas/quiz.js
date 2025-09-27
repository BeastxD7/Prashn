"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizByPdfSchema = exports.generateQuizByTextSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = __importDefault(require("zod"));
exports.generateQuizByTextSchema = zod_1.default.object({
    title: zod_1.default.string().min(5).max(100),
    description: zod_1.default.string().min(10).max(300),
    content: zod_1.default.string().min(5).max(7000),
    preferences: zod_1.default.object({
        numOfQuestions: zod_1.default.number().min(1).max(30).optional().default(5),
        difficulty: zod_1.default.string().transform(val => val.toLowerCase()).pipe(zod_1.default.enum(["easy", "medium", "hard"])).optional().default("medium"),
        questionTypes: zod_1.default.array(zod_1.default.string().pipe(zod_1.default.enum(client_1.QuestionType))).optional().default([client_1.QuestionType.MCQ]),
    }).optional(),
});
exports.generateQuizByPdfSchema = zod_1.default.object({
    title: zod_1.default.string().min(5).max(100),
    description: zod_1.default.string().min(10).max(300),
    questionTypes: zod_1.default
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
            }
            catch (err) {
                // fall back to comma-separated parsing
                return trimmed
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
            }
            return [trimmed];
        }
        return val;
    }, zod_1.default.array(zod_1.default.nativeEnum(client_1.QuestionType)).optional())
        .default([client_1.QuestionType.MCQ]),
    difficulty: zod_1.default
        .preprocess((val) => {
        if (Array.isArray(val)) {
            return val.map((item) => String(item).toUpperCase());
        }
        if (typeof val === "string") {
            return val.toUpperCase();
        }
        return val;
    }, zod_1.default
        .union([zod_1.default.nativeEnum(client_1.Difficulty), zod_1.default.array(zod_1.default.nativeEnum(client_1.Difficulty))])
        .optional())
        .default(client_1.Difficulty.MEDIUM),
    numOfQuestions: zod_1.default
        .preprocess((val) => {
        if (typeof val === "string") {
            const parsed = Number(val);
            return Number.isNaN(parsed) ? val : parsed;
        }
        return val;
    }, zod_1.default.number().min(1).max(30).optional())
        .default(5),
});
