"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizByAudio = exports.generateQuizByYoutube = exports.generateQuizByPdf = exports.editQuizQuestionsOnly = exports.saveQuiz = exports.generateQuizByText = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const quizllm_1 = require("../aiModels/quizllm");
const fix_json_1 = require("../utils/fix_json");
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const youtube_transcript_1 = require("../utils/youtube-transcript");
const whisper_1 = require("../aiModels/whisper");
const userId = "2c146f96-6a04-4efd-b697-6f0fb60fcfbe";
// Utility: Validate universal question schema (simplified)
function validateQuestion(q) {
    if (!q.type || typeof q.type !== "string")
        return false;
    if (!q.content || typeof q.content !== "string")
        return false;
    if (q.options && !Array.isArray(q.options))
        return false;
    if (!q.answer || (typeof q.answer !== "string" && !Array.isArray(q.answer)))
        return false;
    if (q.explanation && typeof q.explanation !== "string")
        return false;
    if (q.difficulty && !["EASY", "MEDIUM", "HARD"].includes(q.difficulty))
        return false;
    return true;
}
const upload = (0, multer_1.default)({
    limits: { fileSize: 10 * 1024 * 1024 }, // limit file to 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed'));
        }
        cb(null, true);
    },
});
const audioUpload = (0, multer_1.default)({
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
const generateQuizByText = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const requestedQuestions = (preferences === null || preferences === void 0 ? void 0 : preferences.numOfQuestions) || 5;
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

    Use question types: ${((_a = preferences === null || preferences === void 0 ? void 0 : preferences.questionTypes) === null || _a === void 0 ? void 0 : _a.join(", ")) || "MCQ, SHORT_ANSWER"}
    Difficulty level: ${(preferences === null || preferences === void 0 ? void 0 : preferences.difficulty) || "MEDIUM"}

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
        const llmResponse = yield (0, quizllm_1.invokeLLM)(prompt);
        // Fix JSON and parse
        const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
        if (!fixedJson) {
            return res
                .status(422)
                .json({ error: "Invalid JSON output from LLM and fix failed." });
        }
        let questions = JSON.parse(fixedJson);
        // Validate array of questions
        if (!Array.isArray(questions) ||
            questions.some((q) => !validateQuestion(q))) {
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
    }
    catch (error) {
        console.error("Error generating quiz:", error);
        res.status(500).json({ error: "Failed to generate quiz." });
    }
});
exports.generateQuizByText = generateQuizByText;
const saveQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO: userId should come from Request Auth Middleware
        const { quiz, questions } = req.body;
        if (!quiz ||
            !questions ||
            !Array.isArray(questions) ||
            questions.length === 0) {
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
        // Save atomically with Prisma transaction
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const createdQuiz = yield tx.quiz.create({
                data: {
                    title: quiz.title,
                    description: quiz.description,
                    userId: userId,
                },
            });
            const savedQuestions = yield Promise.all(questions.map((q) => tx.question.create({
                data: {
                    quizId: createdQuiz.id,
                    type: q.type,
                    content: q.content,
                    options: q.options,
                    answer: JSON.stringify(q.answer),
                    explanation: q.explanation || null,
                    difficulty: q.difficulty || "MEDIUM",
                },
            })));
            return { quiz: createdQuiz, questions: savedQuestions };
        }));
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error saving quiz:", error);
        res.status(500).json({ error: "Failed to save quiz." });
    }
});
exports.saveQuiz = saveQuiz;
const editQuizQuestionsOnly = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const quiz = yield prisma_1.default.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found.' });
        }
        if (quiz.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized to update questions for this quiz.' });
        }
        // Fetch existing question IDs for this quiz
        const existingQuestions = yield prisma_1.default.question.findMany({
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
        const updatedQuestions = yield prisma_1.default.$transaction(questions.map((q) => prisma_1.default.question.update({
            where: { id: q.id },
            data: {
                type: q.type,
                content: q.content,
                options: q.options ? JSON.stringify(Array.isArray(q.options) ? q.options : JSON.parse(q.options)) : undefined,
                answer: typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer),
                explanation: q.explanation || null,
                difficulty: q.difficulty || 'MEDIUM',
            },
        })));
        res.status(200).json({ quizId, updatedQuestions });
    }
    catch (error) {
        console.error('Error updating quiz questions:', error);
        res.status(500).json({ error: 'Failed to update quiz questions.' });
    }
});
exports.editQuizQuestionsOnly = editQuizQuestionsOnly;
exports.generateQuizByPdf = [
    upload.single('pdfFile'),
    (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.file)
                return res.status(400).json({ error: 'Missing PDF file upload' });
            const { title, description } = req.body;
            let { questionTypes, difficulty, numOfQuestions } = req.body;
            questionTypes = questionTypes ? questionTypes.split(',').map((s) => s.trim()) : ['MCQ', 'SHORT_ANSWER'];
            difficulty = difficulty || 'MEDIUM';
            numOfQuestions = numOfQuestions ? parseInt(numOfQuestions, 10) : 5;
            const pdfData = yield (0, pdf_parse_1.default)(req.file.buffer);
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

    Use question types: ${(questionTypes === null || questionTypes === void 0 ? void 0 : questionTypes.join(", ")) || "MCQ, SHORT_ANSWER"}
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
            const llmResponse = yield (0, quizllm_1.invokeLLM)(prompt);
            const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
            if (!fixedJson)
                return res.status(422).json({ error: 'LLM output was not valid JSON.' });
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
        }
        catch (error) {
            console.error('Error generating quiz from PDF:', error);
            if (error instanceof Error && error.message.includes('Only PDF files allowed')) {
                return res.status(422).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to generate quiz from PDF.' });
        }
    }),
];
const generateQuizByYoutube = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, youtubeUrl, numOfQuestions, questionTypes, difficulty, lang } = req.body;
        if (!youtubeUrl || !title || !numOfQuestions || !description) {
            return res.status(400).json({ error: 'YouTube URL, title, and number of questions are required' });
        }
        // Step 1: Get transcript text
        const transcriptText = yield (0, youtube_transcript_1.getTranscriptText)(youtubeUrl, lang);
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
        const llmResponse = yield (0, quizllm_1.invokeLLM)(prompt);
        // Step 4: Fix JSON & parse
        const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
        if (!fixedJson)
            return res.status(422).json({ error: 'LLM output was not valid JSON.' });
        const questions = JSON.parse(fixedJson);
        console.log(questions);
        // Step 5: Validate questions
        if (!questions ||
            !Array.isArray(questions.questions) ||
            questions.questions.some((q) => !validateQuestion(q))) {
            return res.status(422).json({ error: 'Generated questions have invalid format.' });
        }
        // Step 6: Return generated quiz
        return res.status(200).json({
            quiz: { title, description, userId },
            noOfQuestions: questions.questions.length,
            questions: questions.questions,
        });
    }
    catch (error) {
        console.error('Error generating quiz from YouTube URL:', error);
        res.status(500).json({ error: 'Failed to generate quiz from YouTube URL.' });
    }
});
exports.generateQuizByYoutube = generateQuizByYoutube;
const generateQuizByAudio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        audioUpload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
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
            const transcriptText = yield (0, whisper_1.transcribe)(req.file.buffer);
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
            const llmResponse = yield (0, quizllm_1.invokeLLM)(audioPrompt);
            const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
            if (!fixedJson)
                return res.status(422).json({ error: 'LLM output was not valid JSON.' });
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
        }));
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to generate quiz from Audio.' });
    }
});
exports.generateQuizByAudio = generateQuizByAudio;
