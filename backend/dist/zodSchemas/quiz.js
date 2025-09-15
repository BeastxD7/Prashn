"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizbyTextSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.QuizbyTextSchema = zod_1.default.object({
    title: zod_1.default.string().min(5).max(100),
    description: zod_1.default.string().min(10).max(300),
    content: zod_1.default.string().min(5).max(7000),
    preferences: zod_1.default.object({
        numOfQuestions: zod_1.default.number().min(1).max(20).optional().default(5),
        difficulty: zod_1.default.string().transform(val => val.toLowerCase()).pipe(zod_1.default.enum(["easy", "medium", "hard"])).optional().default("medium"),
        questionTypes: zod_1.default.array(zod_1.default.string().transform(val => val.toLowerCase()).pipe(zod_1.default.enum(["multiple-choice", "true-false", "short-answer"]))).optional().default(["multiple-choice"]),
    }).optional(),
});
