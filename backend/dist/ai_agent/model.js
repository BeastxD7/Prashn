"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callLLM = void 0;
const groq_1 = require("@ai-sdk/groq");
const ai_1 = require("ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GROQ_API_KEY;
const callLLM = async (text) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const result = await (0, ai_1.generateText)({
        model: (0, groq_1.groq)('openai/gpt-oss-20b'),
        providerOptions: {
            apiKey: apiKey,
        },
        prompt: text,
    });
    // Narrow unknown typing so we can safely access nested fields
    const r = result;
    const content = (_g = (_f = (_e = (_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.steps) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.response) === null || _c === void 0 ? void 0 : _c.body) === null || _d === void 0 ? void 0 : _d.choices) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.message) === null || _g === void 0 ? void 0 : _g.content;
    return typeof content === 'string' ? content : String(content !== null && content !== void 0 ? content : '');
};
exports.callLLM = callLLM;
