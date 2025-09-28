"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditRules = void 0;
exports.creditRules = {
    generateQuizByText: {
        tiers: [
            { maxQuestions: 5, credits: 1 },
            { maxQuestions: 15, credits: 2 },
            { maxQuestions: 30, credits: 3 }
        ],
    },
    generateQuizByPdf: {
        tiers: [
            { maxQuestions: 5, credits: 2 },
            { maxQuestions: 15, credits: 3 },
            { maxQuestions: 30, credits: 4 },
        ],
    },
    generateQuizByYoutube: {
        tiers: [
            { maxQuestions: 5, credits: 2 },
            { maxQuestions: 15, credits: 3 },
            { maxQuestions: 30, credits: 4 },
        ],
    },
    generateQuizByAudio: {
        tiers: [
            { maxQuestions: 5, credits: 2 },
            { maxQuestions: 15, credits: 3 },
            { maxQuestions: 30, credits: 4 },
        ],
    },
};
