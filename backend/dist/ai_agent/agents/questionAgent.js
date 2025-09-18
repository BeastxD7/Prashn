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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleQuestion = handleQuestion;
const questionPrompt_1 = require("../../prompts/questionPrompt");
const llm_1 = require("../../aiModels/llm");
function handleQuestion(context) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const prompt = (0, questionPrompt_1.getQuestionPrompt)(context);
        const question = yield (0, llm_1.callLLM)(prompt); // Integrate your LLM call
        return {
            outputType: 'question',
            text: question,
            sessionUpdate: { rounds: ((_a = context.sessionState.rounds) !== null && _a !== void 0 ? _a : 0) + 1 }
        };
    });
}
