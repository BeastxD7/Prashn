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
exports.generateQuestions = exports.createQuiz = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const invokellm_1 = require("../llm/invokellm");
const createQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, userId } = req.body;
        if (!title || !userId) {
            return res.status(400).json({ error: 'Title and userId are required' });
        }
        const newQuiz = yield prisma_1.default.quiz.create({
            data: {
                title,
                description,
                userId,
            },
        });
        res.status(201).json(newQuiz);
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});
exports.createQuiz = createQuiz;
const generateQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { quizId } = req.params;
    const { content, preferences } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required for question generation' });
    }
    try {
        // Build a detailed prompt based on content and preferences
        const prompt = `
You are an expert quiz creator AI.

Based on the following content, generate ${(preferences === null || preferences === void 0 ? void 0 : preferences.numOfQuestions) || 5} quiz questions.

Content:
${content}

Question Types: ${((_a = preferences === null || preferences === void 0 ? void 0 : preferences.questionTypes) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'MCQ, SHORT_ANSWER'}
Difficulty: ${(preferences === null || preferences === void 0 ? void 0 : preferences.difficulty) || 'MEDIUM'}

Return the questions in JSON format containing:
- type (question type)
- content (question text)
- options (array, if applicable)
- answer (correct answer(s))
- explanation (optional)
- difficulty level

Only return valid JSON without any extra text or markdown.
`;
        // Call the LLM with the generated prompt
        const generatedQuestionsRaw = yield (0, invokellm_1.invokeLLM)(prompt);
        // Parse the JSON response safely
        const generatedQuestions = JSON.parse(generatedQuestionsRaw);
        res.status(201).json(generatedQuestions);
    }
    catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ error: 'Failed to generate questions' });
    }
});
exports.generateQuestions = generateQuestions;
