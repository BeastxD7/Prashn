import { Router } from "express";
import { editQuizQuestionsOnly, generateQuizByPdf, generateQuizByText, generateQuizByYoutube,generateQuizByAudio, saveQuiz } from "../controllers/quiz.controller";
import { headerAuth } from "../middleware/user.middleware";

const QuizRouter = Router();

// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text', headerAuth,  generateQuizByText);
QuizRouter.post('/save-quiz', headerAuth,  saveQuiz);
QuizRouter.post('/edit-quiz-questions', headerAuth,  editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf', headerAuth,  generateQuizByPdf);
QuizRouter.post('/generate-quiz-by-youtube', headerAuth,  generateQuizByYoutube);
QuizRouter.post('/generate-quiz-by-audio', headerAuth,  generateQuizByAudio);

export default QuizRouter;