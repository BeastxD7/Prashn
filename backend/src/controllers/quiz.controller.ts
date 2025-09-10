import { Request, Response } from "express";
import prisma from "../db/prisma";
import { invokeLLM } from '../ai_models/quizllm';
import { fixJsonStructure } from "../utils/fix_json";
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { getTranscriptText } from "../utils/youtube-transcript";
import { transcribe } from "../ai_models/whisper";
import { text } from "stream/consumers";

const userId = "2c146f96-6a04-4efd-b697-6f0fb60fcfbe"

// Utility: Validate universal question schema (simplified)
function validateQuestion(q: any): boolean {
  if (!q.type || typeof q.type !== "string") return false;
  if (!q.content || typeof q.content !== "string") return false;
  if (q.options && !Array.isArray(q.options)) return false;
  if (!q.answer || (typeof q.answer !== "string" && !Array.isArray(q.answer)))
    return false;
  if (q.explanation && typeof q.explanation !== "string") return false;
  if (q.difficulty && !["EASY", "MEDIUM", "HARD"].includes(q.difficulty))
    return false;
  return true;
}


const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // limit file to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});

const audioUpload = multer({
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'video/mp4'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only MP3, MP4, or WAV files are allowed'));
    }
    cb(null, true);
  },
}).single('audioFile');

// TODO: Zod validations for all the things!

// POST /api/generate-quiz-by-text
export const generateQuizByText = async (req: Request, res: Response) => {
  try {
    // TODO: userId should come from Request Auth Middleware
    const { title, description, content, preferences } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Missing required fields: title, userId, content." });
    }

    if (content.length > 7000) {
      return res
        .status(400)
        .json({ error: "Content exceeds maximum length of 7,000 characters." });
    }

    // Enforce sensible question count limits
    const maxQuestions = 3000;
    const requestedQuestions = preferences?.numOfQuestions || 5;
    const numOfQuestions = Math.min(requestedQuestions, maxQuestions);

    if (content.length < numOfQuestions * 100) {
      // Heuristic: Require at least ~100 chars per question
      return res.status(400).json({
        error: `Insufficient content length for ${numOfQuestions} questions. Please provide more detailed content or request fewer questions.`,
      });
    }

    // Build prompt with strict instructions
    const prompt = `
    You are a quiz generation AI.

    Generate exactly ${numOfQuestions} quiz questions based ONLY on the following content.
    Do NOT generate fewer or more than ${numOfQuestions}.
    Return ONLY a valid JSON array with exactly ${numOfQuestions} question objects, each with fields:
    type, content, options (if applicable), answer, explanation (optional), difficulty.
    Use ONLY the following content to create the questions:

    Content:
    ---
    ${content}
    ---

    Use question types: ${preferences?.questionTypes?.join(", ") || "MCQ, SHORT_ANSWER"
      }
    Difficulty level: ${preferences?.difficulty || "MEDIUM"}

    Example format:
    [
      {
        "type": "MCQ",
        "content": "Question text",
        "options": ["Option 1", "Option 2"],
        "answer": "Option 1",
        "explanation": "Explanation text.",
        "difficulty": "EASY"
      }
    ]
    `;


    if (prompt.trim().length > 100000) {
      res.status(400).json({ error: "Text length exceeds maximum limit of 100,000 characters." });
      return;
    }

    const llmResponse = await invokeLLM(prompt);


    // Fix JSON and parse
    const fixedJson = fixJsonStructure(llmResponse);
    if (!fixedJson) {
      return res
        .status(422)
        .json({ error: "Invalid JSON output from LLM and fix failed." });
    }
    let questions = JSON.parse(fixedJson);

    // Validate array of questions
    if (
      !Array.isArray(questions) ||
      questions.some((q) => !validateQuestion(q))
    ) {
      return res
        .status(422)
        .json({ error: "LLM returned invalid question format." });
    }

    // Enforce exact number of questions (truncate if too many)
    if (questions.length > numOfQuestions) {
      questions = questions.slice(0, numOfQuestions);
    }

    // Pad with repeated last question if fewer than needed (optional)
    while (questions.length < numOfQuestions) {
      questions.push(questions[questions.length - 1]);
    }

    res.status(200).json({
      quiz: { title, description, userId },
      noOfQuestions: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
};

// POST /api/save-quiz
export const saveQuiz = async (req: Request, res: Response) => {
  try {
    // TODO: userId should come from Request Auth Middleware
    const { quiz, questions } = req.body;

    if (
      !quiz ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({
          error: "Missing or invalid fields: quiz, questions required.",
        });
    }

    // Validate each question
    if (questions.some((q) => !validateQuestion(q))) {
      return res
        .status(422)
        .json({ error: "Invalid question data in request." });
    }

    interface Quiz {
      id: any;
      title: string;
      description: string | null;
      userId: string;
    }

    // Save atomically with Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdQuiz: Quiz = await tx.quiz.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          userId: userId,
        },
      });

      const savedQuestions = await Promise.all(
        questions.map((q) =>
          tx.question.create({
            data: {
              quizId: createdQuiz.id,
              type: q.type,
              content: q.content,
              options: q.options,
              answer: JSON.stringify(q.answer),
              explanation: q.explanation || null,
              difficulty: q.difficulty || "MEDIUM",
            },
          })
        )
      );

      return { quiz: createdQuiz, questions: savedQuestions };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error saving quiz:", error);
    res.status(500).json({ error: "Failed to save quiz." });
  }
};

export const editQuizQuestionsOnly = async (req: Request, res: Response) => {
  try {

    // TODO: userId should come from Request Auth Middleware
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required and cannot be empty.' });
    }

    // Validate questions format and IDs
    for (const q of questions) {
      if (!validateQuestion(q)) {
        return res.status(422).json({ error: 'Invalid question format detected.' });
      }
      if (!q.quizId || !q.id) {
        return res.status(400).json({ error: 'Each question must have quizId and id.' });
      }
    }

    // Ensure all questions belong to the same quiz
    const quizIds = new Set(questions.map(q => q.quizId));
    if (quizIds.size > 1) {
      return res.status(400).json({ error: 'All questions must belong to the same quiz.' });
    }
    const quizId = [...quizIds][0];

    // Verify ownership of the quiz
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }
    if (quiz.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update questions for this quiz.' });
    }

    // Fetch existing question IDs for this quiz
    const existingQuestions = await prisma.question.findMany({
      where: { quizId },
      select: { id: true },
    });
    const existingIds = new Set(existingQuestions.map(q => q.id));

    // Ensure all question IDs belong to the quiz, no creation or deletion
    for (const q of questions) {
      if (!existingIds.has(q.id)) {
        return res.status(400).json({ error: `Question id ${q.id} does not belong to quiz ${quizId}.` });
      }
    }
    for (const id of existingIds) {
      if (!questions.some(q => q.id === id)) {
        return res.status(400).json({ error: `Question id ${id} is missing in request; question deletion not allowed.` });
      }
    }

    // Transactionally update all questions
    const updatedQuestions = await prisma.$transaction(
      questions.map((q) =>
        prisma.question.update({
          where: { id: q.id },
          data: {
            type: q.type,
            content: q.content,
            options: q.options ? JSON.stringify(Array.isArray(q.options) ? q.options : JSON.parse(q.options)) : undefined,
            answer: typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer),
            explanation: q.explanation || null,
            difficulty: q.difficulty || 'MEDIUM',
          },
        }),
      ),
    );

    res.status(200).json({ quizId, updatedQuestions });
  } catch (error) {
    console.error('Error updating quiz questions:', error);
    res.status(500).json({ error: 'Failed to update quiz questions.' });
  }
};

export const generateQuizByPdf = [
  upload.single('pdfFile'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Missing PDF file upload' });

      const { title, description } = req.body;
      let { questionTypes, difficulty, numOfQuestions } = req.body;

      questionTypes = questionTypes ? questionTypes.split(',').map((s: string) => s.trim()) : ['MCQ', 'SHORT_ANSWER'];
      difficulty = difficulty || 'MEDIUM';
      numOfQuestions = numOfQuestions ? parseInt(numOfQuestions, 10) : 5;

      const pdfData = await pdfParse(req.file.buffer);
      const content = pdfData.text;

      if (!content || content.trim().length === 0) {
        return res.status(422).json({ error: 'Failed to extract text from PDF or PDF is empty.' });
      }

      const prompt = `
    You are a quiz generation AI.

    Generate exactly ${numOfQuestions} quiz questions based ONLY on the following content which is extracted from PDF.
    Do NOT generate fewer or more than ${numOfQuestions}.
    Return ONLY a valid JSON array with exactly ${numOfQuestions} question objects, each with fields:
    type, content, options (if applicable), answer, explanation (optional), difficulty.
    Use ONLY the following content to create the questions:

    Content:
    ---
    ${content}
    ---

    Use question types: ${questionTypes?.join(", ") || "MCQ, SHORT_ANSWER"
        }
    Difficulty level: ${difficulty || "MEDIUM"}

    Example format:
    [
      {
        "type": "MCQ",
        "content": "Question text",
        "options": ["Option 1", "Option 2"],
        "answer": "Option 1",
        "explanation": "Explanation text.",
        "difficulty": "EASY"
      }
    ]
    `;


      if (prompt.trim().length > 100000) {
        res.status(400).json({ error: "PDF Text exceeds maximum length of 100,000 characters." });
        return;
      }

      const llmResponse = await invokeLLM(prompt);


      const fixedJson = fixJsonStructure(llmResponse);
      if (!fixedJson) return res.status(422).json({ error: 'LLM output was not valid JSON.' });
      console.log(fixedJson);

      let questions = JSON.parse(fixedJson);

      console.log("Parsed questions:", questions);
      console.log(`Number of questions generated: ${questions.questions.length}`);


      // Remove extra questions if too many (preserve only the first numOfQuestions)
      if (questions.length > numOfQuestions) {
        console.log(`Truncating questions from ${questions.questions.length} to ${numOfQuestions}`);

        questions.questions = questions.questions.slice(0, numOfQuestions);
      }

      res.status(200).json({
        quiz: { title, description, userId },
        noOfQuestions: questions.questions.length,
        questions,
      });
    } catch (error) {
      console.error('Error generating quiz from PDF:', error);
      if (error instanceof Error && error.message.includes('Only PDF files allowed')) {
        return res.status(422).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to generate quiz from PDF.' });
    }
  },
];

export const generateQuizByYoutube = async (req: Request, res: Response) => {
  try {
    const { title, description, youtubeUrl, numOfQuestions, questionTypes, difficulty, lang } = req.body;

    if (!youtubeUrl || !title || !numOfQuestions || !description) {
      return res.status(400).json({ error: 'YouTube URL, title, and number of questions are required' });
    }

    // Step 1: Get transcript text
    const transcriptText = await getTranscriptText(youtubeUrl, lang);
    // console.log(transcriptText);

    if (transcriptText.trim().length > 100000) {
      res.status(400).json({ error: "Youtube video transcript exceeds maximum length of 100,000 characters." });
      return;
    }

    if (!transcriptText || transcriptText.length === 0) {
      return res.status(422).json({ error: 'Failed to retrieve transcript or transcript is empty.' });
    }

    // Step 2: Build prompt for LLM
    const prompt = `
    You are a quiz generation AI.

    Generate exactly ${numOfQuestions} quiz questions from the following YouTube video transcript:

    ---
    ${transcriptText}
    ---

    Use question types: ${Array.isArray(questionTypes) ? questionTypes.join(', ') : questionTypes}
    Difficulty: ${difficulty}

    Return ONLY a valid JSON array with each question object containing:
    type, content, options (if any), answer, explanation (optional), difficulty.
    `;

    // Step 3: Invoke LLM
    const llmResponse = await invokeLLM(prompt);

    // Step 4: Fix JSON & parse
    const fixedJson = fixJsonStructure(llmResponse);
    if (!fixedJson) return res.status(422).json({ error: 'LLM output was not valid JSON.' });

    const questions = JSON.parse(fixedJson);
    console.log(questions);



    // Step 5: Validate questions
    if (
      !questions ||
      !Array.isArray(questions.questions) ||
      questions.questions.some((q: any) => !validateQuestion(q))
    ) {
      return res.status(422).json({ error: 'Generated questions have invalid format.' });
    }


    // Step 6: Return generated quiz
    return res.status(200).json({
      quiz: { title, description, userId },
      noOfQuestions: questions.questions.length,
      questions: questions.questions,
    });
  } catch (error) {
    console.error('Error generating quiz from YouTube URL:', error);
    res.status(500).json({ error: 'Failed to generate quiz from YouTube URL.' });
  }
};

export const generateQuizByAudio = async (req: Request, res: Response) => {

  try {



    audioUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Missing audio file upload.' });
      }

      console.log(req.file);
      const { title, description, numOfQuestions, questionTypes, difficulty } = req.body;

      if (!title || !numOfQuestions || !description || !req.file || !questionTypes || !difficulty) {
        return res.status(400).json({ error: 'All fields are required in payload.' });
      }


      const transcriptText = await transcribe(req.file.buffer);

      if (!transcriptText) {
        return res.status(422).json({ error: 'Failed to transcribe audio.' });
      }


      if (transcriptText.trim().length > 100000) {
        res.status(400).json({ error: "Audio text exceeds maximum length of 100,000 characters." });
        return;
      }

const audioPrompt = `
     You are a quiz generation AI.

    Generate exactly ${numOfQuestions} quiz questions based ONLY on the following content which is extracted from PDF.
    Do NOT generate fewer or more than ${numOfQuestions}.
    Return ONLY a valid JSON array with exactly ${numOfQuestions} question objects, each with fields:
    type, content, options (if applicable), answer, explanation (optional), difficulty.
    Use ONLY the following content to create the questions:

    Content:
    ---
    ${transcriptText}
    ---

    Use question types: ${questionTypes || "MCQ, SHORT_ANSWER"}
    Difficulty level: ${difficulty || "MEDIUM"}

    Example format:
    [
      {
        "type": "MCQ",
        "content": "Question text",
        "options": ["Option 1", "Option 2"],
        "answer": "Option 1",
        "explanation": "Explanation text.",
        "difficulty": "EASY"
      }
    ]
    `;


      const llmResponse = await invokeLLM(audioPrompt);

      const fixedJson = fixJsonStructure(llmResponse);
      if (!fixedJson) return res.status(422).json({ error: 'LLM output was not valid JSON.' });
      console.log(fixedJson);

      let questions = JSON.parse(fixedJson);

      console.log("Parsed questions:", questions);
      console.log(`Number of questions generated: ${questions.questions.length}`);


      // Remove extra questions if too many (preserve only the first numOfQuestions)
      if (questions.length > numOfQuestions) {
        console.log(`Truncating questions from ${questions.length} to ${numOfQuestions}`);

        questions = questions.slice(0, numOfQuestions);
      }

      res.status(200).json({
        quiz: { title, description, userId },
        noOfQuestions: questions.length,
        questions,
      });
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to generate quiz from Audio.' });

  }

}