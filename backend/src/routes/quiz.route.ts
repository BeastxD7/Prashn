import { Router } from "express";
import { editQuizQuestionsOnly, generateQuizByPdf, generateQuizByText, saveQuiz } from "../controllers/quiz.controller";

const QuizRouter = Router();

// POST /api/quiz - create a new quiz
QuizRouter.post('/generate-quiz-by-text', generateQuizByText);
QuizRouter.post('/save-quiz', saveQuiz);
QuizRouter.post('/edit-quiz-questions', editQuizQuestionsOnly);
QuizRouter.post('/generate-quiz-by-pdf', generateQuizByPdf);


export default QuizRouter;