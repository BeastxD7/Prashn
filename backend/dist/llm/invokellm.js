"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeLLM = invokeLLM;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default();
const default_model = "openai/gpt-oss-120b";
function invokeLLM(prompt_1) {
    return __awaiter(this, arguments, void 0, function* (prompt, model = default_model) {
        var _a, _b;
        const completion = yield groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful quiz generation assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: model,
            temperature: 0,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "quiz_questions",
                    schema: {
                        type: "object",
                        properties: {
                            questions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        type: { type: "string", enum: ["MCQ", "SHORT_ANSWER", "TRUE_FALSE", "FILL_IN_THE_BLANK", "MATCHING", "ESSAY", "ORDERING"] },
                                        content: { type: "string" },
                                        options: {
                                            type: "array",
                                            items: { type: "string" }
                                        },
                                        answer: { type: "string" },
                                        explanation: { type: "string" },
                                        difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] }
                                    },
                                    required: ["type", "content", "options", "answer", "explanation", "difficulty"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["questions"],
                        additionalProperties: false
                    }
                }
            }
        });
        return ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
    });
}
