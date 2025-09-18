"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoryPrompt = getStoryPrompt;
function getStoryPrompt(context) {
    return `Write a short, metaphorical story that sets up an engaging scenario related to: "${context.userQuery}". Be creative and hint at the concept, but don't explain it outright.`;
}
