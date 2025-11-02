import { Router } from "express";
import { editQuizQuestionsOnly, generateQuizByPdf, generateQuizByText, getQuizById, generateQuizByYoutube,generateQuizByAudio, saveQuiz, toggleQuizPrivacy, toggleQuizRequireLogin } from "../controllers/quiz.controller";
import { cookieAuth, headerAuth, optionalAuth } from "../middleware/user.middleware";

const QuizRouter = Router();

// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text', cookieAuth,  generateQuizByText);
QuizRouter.post('/save-quiz', cookieAuth,  saveQuiz);
QuizRouter.post('/edit-quiz-questions', cookieAuth,  editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf', cookieAuth,  generateQuizByPdf);
QuizRouter.post('/generate-quiz-by-youtube', cookieAuth,  generateQuizByYoutube);
QuizRouter.post('/generate-quiz-by-audio', cookieAuth,  generateQuizByAudio);
// Publicish endpoint: optionalAuth will populate req.userId when a valid token is provided.
QuizRouter.get('/get-quiz-by-id', optionalAuth, getQuizById);
// PATCH /api/quiz/:id/privacy - owner-only: toggle or set isPublic
QuizRouter.patch('/:id/privacy', cookieAuth, toggleQuizPrivacy);
QuizRouter.patch('/:id/require-login', cookieAuth, toggleQuizRequireLogin);

export default QuizRouter;