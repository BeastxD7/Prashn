import { Router } from "express";
import { createQuiz, generateQuestions } from "../controllers/quiz.controller";

const QuizRouter = Router();

// POST /api/quiz - create a new quiz
QuizRouter.post('/', createQuiz);
QuizRouter.post('/:quizId/generate-questions', generateQuestions);

export default QuizRouter;