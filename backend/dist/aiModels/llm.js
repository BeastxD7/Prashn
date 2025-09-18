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
exports.callLLM = callLLM;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default();
const default_model = "meta-llama/llama-4-scout-17b-16e-instruct";
function callLLM(prompt_1) {
    return __awaiter(this, arguments, void 0, function* (prompt, model = default_model) {
        var _a, _b;
        if (prompt.trim().length > 100000) {
            throw new Error("Prompt exceeds maximum length of 100,000 characters.");
        }
        try {
            const completion = yield groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: model,
                temperature: 0,
            });
            return ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "";
        }
        catch (error) {
            console.error("Error invoking LLM:", error);
            throw new Error("Failed to invoke LLM");
        }
    });
}
