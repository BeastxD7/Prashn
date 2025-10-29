"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quiz_controller_1 = require("../controllers/quiz.controller");
const user_middleware_1 = require("../middleware/user.middleware");
const QuizRouter = (0, express_1.Router)();
// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text', user_middleware_1.cookieAuth, quiz_controller_1.generateQuizByText);
QuizRouter.post('/save-quiz', user_middleware_1.cookieAuth, quiz_controller_1.saveQuiz);
QuizRouter.post('/edit-quiz-questions', user_middleware_1.cookieAuth, quiz_controller_1.editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf', user_middleware_1.cookieAuth, quiz_controller_1.generateQuizByPdf);
QuizRouter.post('/generate-quiz-by-youtube', user_middleware_1.cookieAuth, quiz_controller_1.generateQuizByYoutube);
QuizRouter.post('/generate-quiz-by-audio', user_middleware_1.cookieAuth, quiz_controller_1.generateQuizByAudio);
// Publicish endpoint: optionalAuth will populate req.userId when a valid token is provided.
QuizRouter.get('/get-quiz-by-id', user_middleware_1.optionalAuth, quiz_controller_1.getQuizById);
// PATCH /api/quiz/:id/privacy - owner-only: toggle or set isPublic
QuizRouter.patch('/:id/privacy', user_middleware_1.cookieAuth, quiz_controller_1.toggleQuizPrivacy);
QuizRouter.patch('/:id/require-login', user_middleware_1.cookieAuth, quiz_controller_1.toggleQuizRequireLogin);
exports.default = QuizRouter;
