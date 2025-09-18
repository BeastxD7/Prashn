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
exports.runConversation = runConversation;
const storytellingAgent_1 = require("./agents/storytellingAgent");
const questionAgent_1 = require("./agents/questionAgent");
const connectorAgent_1 = require("./agents/connectorAgent");
function runConversation(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const { phase, rounds } = context.sessionState;
        if (phase === 'start') {
            return yield (0, storytellingAgent_1.handleStory)(context);
        }
        else if (phase === 'question') {
            // After 2 rounds, connect the story
            if ((rounds !== null && rounds !== void 0 ? rounds : 0) >= 2) {
                return yield (0, connectorAgent_1.handleConnector)(context);
            }
            return yield (0, questionAgent_1.handleQuestion)(context);
        }
        else if (phase === 'synthesis') {
            return yield (0, connectorAgent_1.handleConnector)(context);
        }
        else {
            // Default/fallback to story
            return yield (0, storytellingAgent_1.handleStory)(context);
        }
    });
}
