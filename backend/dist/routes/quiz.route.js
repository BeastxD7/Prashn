"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const QuizRouter = (0, express_1.Router)();
// POST /api/quiz - create a new quiz
QuizRouter.post('/', quiz_controller_1.createQuiz);
QuizRouter.post('/:quizId/generate-questions', quiz_controller_1.generateQuestions);
exports.default = QuizRouter;
