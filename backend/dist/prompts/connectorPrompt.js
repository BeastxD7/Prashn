"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectorPrompt = getConnectorPrompt;
function getConnectorPrompt(context) {
    return `Given the story and the user's answers: "${context.storySoFar}", "${context.previousAnswers}", gently explain how this story leads to the real concept: "${context.userQuery}", making the connection clear and memorable.`;
}
