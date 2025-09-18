"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionPrompt = getQuestionPrompt;
function getQuestionPrompt(context) {
    return `Based on the ongoing story: "${context.storySoFar}", ask the user a fun and thoughtful question to involve them, without telling the answer.`;
}
