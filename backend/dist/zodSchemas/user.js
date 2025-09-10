"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateQuizByVideoSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.GenerateQuizByVideoSchema = zod_1.default.object({
    videoUrl: zod_1.default.string().url(),
    numQuestions: zod_1.default.number().min(1).max(20).optional().default(5),
    difficulty: zod_1.default.enum(["easy", "medium", "hard"]).optional().default("medium"),
    topic: zod_1.default.string().optional().default("General"),
});
