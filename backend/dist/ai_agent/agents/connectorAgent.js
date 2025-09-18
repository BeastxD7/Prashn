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
exports.handleConnector = handleConnector;
const connectorPrompt_1 = require("../../prompts/connectorPrompt");
const llm_1 = require("../../aiModels/llm");
function handleConnector(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const prompt = (0, connectorPrompt_1.getConnectorPrompt)(context);
        const connection = yield (0, llm_1.callLLM)(prompt); // Integrate your LLM call
        return {
            outputType: 'synthesis',
            text: connection,
            sessionUpdate: { phase: 'synthesis' }
        };
    });
}
