import { Router } from "express";
import { editQuizQuestionsOnly, generateQuizByPdf, generateQuizByText, generateQuizByYoutube,generateQuizByAudio, saveQuiz } from "../controllers/quiz.controller";
import { auth } from "../middleware/user.middleware";

const QuizRouter = Router();

// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text',auth,  generateQuizByText);
QuizRouter.post('/save-quiz',auth,  saveQuiz);
QuizRouter.post('/edit-quiz-questions',auth,  editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf',auth,  generateQuizByPdf);
QuizRouter.post('/generate-quiz-by-youtube',auth,  generateQuizByYoutube);
QuizRouter.post('/generate-quiz-by-audio',auth,  generateQuizByAudio);

export default QuizRouter;