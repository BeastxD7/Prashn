"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const QuizRouter = (0, express_1.Router)();
// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text', quiz_controller_1.generateQuizByText);
QuizRouter.post('/save-quiz', quiz_controller_1.saveQuiz);
QuizRouter.post('/edit-quiz-questions', quiz_controller_1.editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf', quiz_controller_1.generateQuizByPdf);
QuizRouter.post('/generate-quiz-by-youtube', quiz_controller_1.generateQuizByYoutube);
QuizRouter.post('/generate-quiz-by-audio', quiz_controller_1.generateQuizByAudio);
exports.default = QuizRouter;
