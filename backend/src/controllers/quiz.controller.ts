import { Request,Response } from "express";
import prisma from "../db/prisma";
import { invokeLLM } from "../llm/invokellm";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const userId = "a800e4ff-e11d-47a7-9352-4f4d944f556a";

    if (!title || !userId) {
      return res.status(400).json({ error: 'Title and userId are required' });
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        description,
        userId,
      },
    });

    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

export const generateQuestions = async (req: Request, res: Response) => {
  const { quizId } = req.params;
  const { content, preferences } = req.body;

  if (!content || !preferences) {
    return res.status(400).json({ error: 'Content and preferences are required for question generation' });
  }

  try {
    // Build a detailed prompt based on content and preferences
const prompt = `
You are an expert quiz creator AI.

Based on the following content, generate ${preferences?.numOfQuestions || 5} quiz questions.

Content:
${content}

Question Types: ${preferences?.questionTypes?.join(', ') || 'MCQ, SHORT_ANSWER'}
Difficulty: ${preferences?.difficulty || 'MEDIUM'}

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
    const generatedQuestionsRaw = await invokeLLM(prompt);

    // Parse the JSON response safely
    const generatedQuestions = JSON.parse(generatedQuestionsRaw);

    res.status(201).json(generatedQuestions);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};