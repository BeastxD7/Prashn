import { Router } from "express";
import { editQuizQuestionsOnly, generateQuizByPdf, generateQuizByText, getQuizById, generateQuizByYoutube,generateQuizByAudio, saveQuiz } from "../controllers/quiz.controller";
import { cookieAuth, headerAuth } from "../middleware/user.middleware";

const QuizRouter = Router();

// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text', cookieAuth,  generateQuizByText);
QuizRouter.post('/save-quiz', headerAuth,  saveQuiz);
QuizRouter.post('/edit-quiz-questions', headerAuth,  editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf', headerAuth,  generateQuizByPdf);
QuizRouter.post('/generate-quiz-by-youtube', headerAuth,  generateQuizByYoutube);
QuizRouter.post('/generate-quiz-by-audio', headerAuth,  generateQuizByAudio);
QuizRouter.get('/get-quiz-by-id', cookieAuth,  getQuizById);

export default QuizRouter;