"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuizById = exports.generateQuizByAudio = exports.generateQuizByYoutube = exports.generateQuizByPdf = exports.editQuizQuestionsOnly = exports.saveQuiz = exports.toggleQuizRequireLogin = exports.toggleQuizPrivacy = exports.generateQuizByText = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const quizllm_1 = require("../aiModels/quizllm");
const fix_json_1 = require("../utils/fix_json");
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const youtube_transcript_1 = require("../utils/youtube-transcript");
const whisper_1 = require("../aiModels/whisper");
const quiz_1 = require("../zodSchemas/quiz");
const creditsUtil_1 = require("../utils/creditsUtil");
const music_metadata_1 = require("music-metadata");
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
const generateQuizByText = async (req, res) => {
    var _a;
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing userId" });
        }
        const { data, error } = quiz_1.generateQuizByTextSchema.safeParse(req.body);
        if (error) {
            return res.status(400).json({ message: error.issues });
        }
        const { title, description, content, preferences } = data;
        // Validate required fields
        if (!title || !content) {
            return res
                .status(400)
                .json({ error: "Missing required fields: title, userId, content." });
        }
        if (content.length > 7000) {
            return res
                .status(400)
                .json({ message: "Content exceeds maximum length of 7,000 characters." });
        }
        // Enforce sensible question count limits
        const maxQuestions = 30;
        const requestedQuestions = (preferences === null || preferences === void 0 ? void 0 : preferences.numOfQuestions) || 5;
        const numOfQuestions = Math.min(requestedQuestions, maxQuestions + 1);
        const requiredCredits = (0, creditsUtil_1.getRequiredCreditsForQuestions)("generateQuizByText", numOfQuestions);
        const hasEnoughCredits = await (0, creditsUtil_1.checkAndDeductCredits)(userId, requiredCredits);
        if (!hasEnoughCredits) {
            return res.status(402).json({ message: "Insufficient credits to generate quiz.", requiredCredits });
        }
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
        const llmResponse = await (0, quizllm_1.invokeLLM)(prompt);
        // Fix JSON and parse
        const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
        if (!fixedJson) {
            return res
                .status(422)
                .json({ error: "Invalid JSON output from LLM and fix failed." });
        }
        let questions = JSON.parse(fixedJson);
        // Normalize parsed structure into an array of question objects
        const questionsArray = Array.isArray(questions)
            ? questions
            : Array.isArray(questions === null || questions === void 0 ? void 0 : questions.questions)
                ? questions.questions
                : [];
        // Enforce exact number of questions (truncate if too many)
        if (questionsArray.length > numOfQuestions) {
            questionsArray.splice(numOfQuestions);
        }
        // Pad with repeated last question if fewer than needed (optional)
        while (questionsArray.length < numOfQuestions) {
            questionsArray.push(questionsArray[questionsArray.length - 1]);
        }
        // Validate questions before saving
        if (questionsArray.some((q) => !validateQuestion(q))) {
            return res.status(422).json({ error: 'Generated questions have invalid format.' });
        }
        // Save quiz and questions atomically in the database
        const isPublic = !!req.body.isPublic;
        const requiresLogin = !!req.body.requiresLogin;
        const result = await prisma_1.default.$transaction(async (tx) => {
            const createdQuiz = await tx.quiz.create({
                data: {
                    title,
                    description,
                    userId: req.userId,
                    isPublic,
                    requiresLogin,
                },
            });
            const savedQuestions = await Promise.all(questionsArray.map((q) => tx.question.create({
                data: {
                    quizId: createdQuiz.id,
                    type: q.type,
                    content: q.content,
                    options: q.options || null,
                    answer: JSON.stringify(q.answer),
                    explanation: q.explanation || null,
                    difficulty: q.difficulty || 'MEDIUM',
                },
            })));
            return { quiz: createdQuiz, questions: savedQuestions };
        });
        res.status(201).json({
            status: true,
            quiz: result.quiz,
            questions: result.questions,
            noOfQuestions: result.questions.length,
            creditsCharged: requiredCredits,
        });
    }
    catch (error) {
        console.error("Error generating quiz:", error);
        res.status(500).json({ error: "Failed to generate quiz." });
    }
};
exports.generateQuizByText = generateQuizByText;
// Owner-only: toggle or set the quiz's isPublic flag
const toggleQuizPrivacy = async (req, res) => {
    var _a;
    try {
        // Owner-only: update quiz.isPublic based on request body
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        const idParam = req.params.id;
        const idNum = Number(idParam);
        if (!Number.isFinite(idNum)) {
            return res.status(400).json({ status: false, message: 'Invalid quiz id' });
        }
        const quiz = await prisma_1.default.quiz.findUnique({ where: { id: idNum } });
        if (!quiz)
            return res.status(404).json({ status: false, message: 'Quiz not found' });
        if (quiz.userId !== userId)
            return res.status(403).json({ status: false, message: 'Not authorized' });
        const requested = (_a = req.body) === null || _a === void 0 ? void 0 : _a.isPublic;
        if (typeof requested !== 'boolean') {
            return res.status(400).json({ status: false, message: 'isPublic boolean is required in request body' });
        }
        const updated = await prisma_1.default.quiz.update({ where: { id: idNum }, data: { isPublic: requested } });
        return res.status(200).json({ status: true, quiz: updated });
    }
    catch (error) {
        console.error('Error updating quiz visibility:', error);
        return res.status(500).json({ status: false, message: 'Failed to update quiz visibility' });
    }
};
exports.toggleQuizPrivacy = toggleQuizPrivacy;
// Owner-only: toggle or set the quiz's requiresLogin flag (require login to view when public)
const toggleQuizRequireLogin = async (req, res) => {
    var _a;
    try {
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ status: false, message: 'Unauthorized' });
        const idParam = req.params.id;
        const idNum = Number(idParam);
        if (!Number.isFinite(idNum)) {
            return res.status(400).json({ status: false, message: 'Invalid quiz id' });
        }
        const quiz = await prisma_1.default.quiz.findUnique({ where: { id: idNum } });
        if (!quiz)
            return res.status(404).json({ status: false, message: 'Quiz not found' });
        if (quiz.userId !== userId)
            return res.status(403).json({ status: false, message: 'Not authorized' });
        // If body contains explicit requiresLogin, use it; otherwise toggle
        const requested = (_a = req.body) === null || _a === void 0 ? void 0 : _a.requiresLogin;
        const newRequiresLogin = typeof requested === 'boolean' ? requested : !quiz.requiresLogin;
        const updated = await prisma_1.default.quiz.update({ where: { id: idNum }, data: { requiresLogin: newRequiresLogin } });
        return res.status(200).json({ status: true, quiz: updated });
    }
    catch (error) {
        console.error('Error toggling quiz requiresLogin:', error);
        return res.status(500).json({ status: false, message: 'Failed to update quiz requiresLogin' });
    }
};
exports.toggleQuizRequireLogin = toggleQuizRequireLogin;
const saveQuiz = async (req, res) => {
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
        const result = await prisma_1.default.$transaction(async (tx) => {
            const createdQuiz = await tx.quiz.create({
                data: {
                    title: quiz.title,
                    description: quiz.description,
                    userId: req.userId,
                    isPublic: !!quiz.isPublic,
                    requiresLogin: !!quiz.requiresLogin,
                },
            });
            const savedQuestions = await Promise.all(questions.map((q) => tx.question.create({
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
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error saving quiz:", error);
        res.status(500).json({ error: "Failed to save quiz." });
    }
};
exports.saveQuiz = saveQuiz;
const editQuizQuestionsOnly = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing userId" });
        }
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
        const quiz = await prisma_1.default.quiz.findUnique({ where: { id: quizId } });
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found.' });
        }
        if (quiz.userId !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to update questions for this quiz.' });
        }
        // Fetch existing question IDs for this quiz
        const existingQuestions = await prisma_1.default.question.findMany({
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
        const updatedQuestions = await prisma_1.default.$transaction(questions.map((q) => {
            // Prepare a safe JSON value for options (Prisma's JSON type expects a JS value, not a string)
            let optionsValue = undefined;
            if (q.options !== undefined && q.options !== null) {
                if (Array.isArray(q.options)) {
                    optionsValue = q.options;
                }
                else {
                    try {
                        const parsed = JSON.parse(q.options);
                        optionsValue = Array.isArray(parsed) ? parsed : [parsed];
                    }
                    catch (e) {
                        // If parsing fails, wrap the raw value in an array to keep structure consistent
                        optionsValue = [q.options];
                    }
                }
            }
            return prisma_1.default.question.update({
                where: { id: q.id },
                data: {
                    type: q.type,
                    content: q.content,
                    options: optionsValue !== undefined ? optionsValue : undefined,
                    answer: typeof q.answer === 'string' ? q.answer : JSON.stringify(q.answer),
                    explanation: q.explanation || null,
                    difficulty: q.difficulty || 'MEDIUM',
                },
            });
        }));
        res.status(200).json({ quizId, updatedQuestions });
    }
    catch (error) {
        console.error('Error updating quiz questions:', error);
        res.status(500).json({ error: 'Failed to update quiz questions.' });
    }
};
exports.editQuizQuestionsOnly = editQuizQuestionsOnly;
exports.generateQuizByPdf = [
    upload.single('pdfFile'),
    async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized: Missing userId" });
            }
            if (!req.file)
                return res.status(400).json({ error: 'Missing PDF file upload' });
            const parseResult = quiz_1.generateQuizByPdfSchema.safeParse(req.body);
            if (!parseResult.success) {
                return res.status(400).json({ error: parseResult.error.issues });
            }
            const { title, description } = parseResult.data;
            const { questionTypes, difficulty, numOfQuestions } = parseResult.data;
            const normalizedQuestionTypes = Array.isArray(questionTypes)
                ? questionTypes
                : [questionTypes];
            const resolvedDifficulty = Array.isArray(difficulty)
                ? difficulty[0]
                : difficulty || 'MEDIUM';
            const normalizedNumOfQuestions = numOfQuestions ? Number(numOfQuestions) : 5;
            const sanitizedQuestions = Number.isFinite(normalizedNumOfQuestions) && normalizedNumOfQuestions > 0
                ? Math.min(normalizedNumOfQuestions, 30)
                : 5;
            const requiredCredits = (0, creditsUtil_1.getRequiredCreditsForQuestions)("generateQuizByPdf", sanitizedQuestions);
            const hasEnoughCredits = await (0, creditsUtil_1.checkAndDeductCredits)(userId, requiredCredits);
            if (!hasEnoughCredits) {
                return res.status(402).json({ error: "Insufficient credits to generate quiz.", requiredCredits });
            }
            const pdfData = await (0, pdf_parse_1.default)(req.file.buffer);
            const content = pdfData.text;
            if (!content || content.trim().length === 0) {
                return res.status(422).json({ error: 'Failed to extract text from PDF or PDF is empty.' });
            }
            const prompt = `
    You are a quiz generation AI.

  Generate exactly ${sanitizedQuestions} quiz questions based ONLY on the following content which is extracted from PDF.
    Do NOT generate fewer or more than ${sanitizedQuestions}.
    Return ONLY a valid JSON array with exactly ${sanitizedQuestions} question objects, each with fields:
    type, content, options (if applicable), answer, explanation (optional), difficulty.
    Use ONLY the following content to create the questions:

    Content:
    ---
    ${content}
    ---

  Use question types: ${(normalizedQuestionTypes === null || normalizedQuestionTypes === void 0 ? void 0 : normalizedQuestionTypes.join(", ")) || "MCQ, SHORT_ANSWER"}
    Difficulty level: ${resolvedDifficulty || "MEDIUM"}

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
            const llmResponse = await (0, quizllm_1.invokeLLM)(prompt);
            const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
            if (!fixedJson)
                return res.status(422).json({ error: 'LLM output was not valid JSON.' });
            console.log(fixedJson);
            const parsed = JSON.parse(fixedJson);
            // Normalize parsed structure into an array of question objects
            const questionsArray = Array.isArray(parsed)
                ? parsed
                : Array.isArray(parsed === null || parsed === void 0 ? void 0 : parsed.questions)
                    ? parsed.questions
                    : [];
            console.log("Parsed questions:", questionsArray);
            console.log(`Number of questions generated: ${questionsArray.length}`);
            // Enforce exact number of questions (truncate if too many)
            if (questionsArray.length > sanitizedQuestions) {
                questionsArray.splice(sanitizedQuestions);
            }
            // Pad with repeated last question if fewer than needed (optional)
            while (questionsArray.length < sanitizedQuestions && questionsArray.length > 0) {
                questionsArray.push(questionsArray[questionsArray.length - 1]);
            }
            // Validate questions before saving
            if (questionsArray.length === 0 || questionsArray.some((q) => !validateQuestion(q))) {
                // Refund credits because generation failed/invalid
                await (0, creditsUtil_1.refundCredits)(userId, requiredCredits);
                return res.status(422).json({ error: 'Generated questions have invalid format.' });
            }
            // Save quiz and questions atomically in the database
            const isPublic = !!req.body.isPublic;
            const requiresLogin = !!req.body.requiresLogin;
            const result = await prisma_1.default.$transaction(async (tx) => {
                const createdQuiz = await tx.quiz.create({
                    data: {
                        title,
                        description,
                        userId: req.userId,
                        isPublic,
                        requiresLogin,
                    },
                });
                const savedQuestions = await Promise.all(questionsArray.map((q) => tx.question.create({
                    data: {
                        quizId: createdQuiz.id,
                        type: q.type,
                        content: q.content,
                        options: q.options || null,
                        answer: JSON.stringify(q.answer),
                        explanation: q.explanation || null,
                        difficulty: q.difficulty || 'MEDIUM',
                    },
                })));
                return { quiz: createdQuiz, questions: savedQuestions };
            });
            res.status(201).json({
                status: true,
                quiz: result.quiz,
                questions: result.questions,
                noOfQuestions: result.questions.length,
                creditsCharged: requiredCredits,
            });
        }
        catch (error) {
            console.error('Error generating quiz from PDF:', error);
            if (error instanceof Error && error.message.includes('Only PDF files allowed')) {
                return res.status(422).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to generate quiz from PDF.' });
        }
    },
];
const generateQuizByYoutube = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing userId" });
        }
        const { title, description, youtubeUrl, numOfQuestions, questionTypes, difficulty, lang } = req.body;
        if (!youtubeUrl || !title || !numOfQuestions || !description) {
            return res.status(400).json({ error: 'YouTube URL, title, and number of questions are required' });
        }
        const requestedQuestions = parseInt(numOfQuestions, 10);
        const sanitizedQuestions = Number.isFinite(requestedQuestions) && requestedQuestions > 0
            ? Math.min(requestedQuestions, 30)
            : 5;
        const requiredCredits = (0, creditsUtil_1.getRequiredCreditsForQuestions)("generateQuizByYoutube", sanitizedQuestions);
        const hasEnoughCredits = await (0, creditsUtil_1.checkAndDeductCredits)(userId, requiredCredits);
        if (!hasEnoughCredits) {
            return res.status(402).json({ message: "Insufficient credits to generate quiz." });
        }
        // Step 1: Get transcript text
        const transcriptText = await (0, youtube_transcript_1.getTranscriptText)(youtubeUrl, lang);
        // console.log(transcriptText);
        if (transcriptText.trim().length > 100000) {
            res.status(400).json({ error: "Youtube video transcript exceeds maximum length of 100,000 characters. Try adding a bit less duration video" });
            return;
        }
        if (!transcriptText || transcriptText.length === 0) {
            await (0, creditsUtil_1.refundCredits)(userId, requiredCredits);
            return res.status(422).json({ error: 'Your video doesn\'t have any subtitles/captions.' });
        }
        // Step 2: Build prompt for LLM
        const prompt = `
    You are a quiz generation AI.

  Generate exactly ${sanitizedQuestions} quiz questions from the following YouTube video transcript:

    ---
    ${transcriptText}
    ---

  Use question types: ${Array.isArray(questionTypes) ? questionTypes.join(', ') : questionTypes}
    Difficulty: ${difficulty}

    Return ONLY a valid JSON array with each question object containing:
    type, content, options (if any), answer, explanation (optional), difficulty.
    `;
        // Step 3: Invoke LLM
        const llmResponse = await (0, quizllm_1.invokeLLM)(prompt);
        // Step 4: Fix JSON & parse
        const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
        if (!fixedJson)
            return res.status(422).json({ error: 'LLM output was not valid JSON.' });
        const questions = JSON.parse(fixedJson);
        // console.log(questions);
        // Step 5: Validate questions
        if (!questions ||
            !Array.isArray(questions.questions) ||
            questions.questions.some((q) => !validateQuestion(q))) {
            return res.status(422).json({ error: 'Generated questions have invalid format.' });
        }
        // Step 6: Return generated quiz
        return res.status(200).json({
            quiz: { title, description, userId: req.userId },
            noOfQuestions: questions.questions.length,
            questions: questions.questions,
            creditsCharged: requiredCredits,
        });
    }
    catch (error) {
        console.error('Error generating quiz from YouTube URL:', error);
        res.status(500).json({ error: 'Failed to generate quiz from YouTube URL.' });
    }
};
exports.generateQuizByYoutube = generateQuizByYoutube;
const generateQuizByAudio = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Missing userId" });
        }
        audioUpload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'Missing audio file upload.' });
            }
            console.log(req.file);
            // Get duration of audio in seconds
            const metadata = await (0, music_metadata_1.parseBuffer)(req.file.buffer, req.file.mimetype);
            const durationSeconds = metadata.format.duration;
            console.log(`Audio duration: ${durationSeconds} seconds`);
            // Restrict max duration (example: 10 minutes)
            const maxDurationSeconds = 10 * 60;
            if (durationSeconds && durationSeconds > maxDurationSeconds) {
                return res.status(400).json({ error: `Audio exceeds max allowed duration of 10 minutes` });
            }
            const { title, description, numOfQuestions, questionTypes, difficulty } = req.body;
            if (!title || !numOfQuestions || !req.file || !questionTypes || !difficulty) {
                return res.status(400).json({ error: 'All fields are required in payload.' });
            }
            const requestedQuestions = parseInt(numOfQuestions, 10);
            const sanitizedQuestions = Number.isFinite(requestedQuestions) && requestedQuestions > 0
                ? Math.min(requestedQuestions, 30)
                : 5;
            const requiredCredits = (0, creditsUtil_1.getRequiredCreditsForQuestions)("generateQuizByAudio", sanitizedQuestions);
            const hasEnoughCredits = await (0, creditsUtil_1.checkAndDeductCredits)(userId, requiredCredits);
            if (!hasEnoughCredits) {
                return res.status(402).json({ error: "Insufficient credits to generate quiz." });
            }
            const transcriptText = await (0, whisper_1.transcribe)(req.file.buffer);
            if (!transcriptText) {
                return res.status(422).json({ error: 'Failed to transcribe audio.' });
            }
            if (transcriptText.trim().length > 100000) {
                res.status(400).json({ error: "Audio text exceeds maximum length of 100,000 characters." });
                return;
            }
            const audioPrompt = `
     You are a quiz generation AI.

  Generate exactly ${sanitizedQuestions} quiz questions based ONLY on the following content which is extracted from PDF.
  Do NOT generate fewer or more than ${sanitizedQuestions}.
    Return ONLY a valid JSON array with exactly ${sanitizedQuestions} question objects, each with fields:
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
            let llmResponse;
            if (numOfQuestions > 20) {
                llmResponse = await (0, quizllm_1.invokeLLM)(audioPrompt, "openai/gpt-oss-20b");
            }
            else {
                llmResponse = await (0, quizllm_1.invokeLLM)(audioPrompt);
            }
            const fixedJson = (0, fix_json_1.fixJsonStructure)(llmResponse);
            if (!fixedJson)
                return res.status(422).json({ error: 'LLM output was not valid JSON.' });
            console.log(fixedJson);
            let questions = JSON.parse(fixedJson);
            console.log("Parsed questions:", questions);
            console.log(`Number of questions generated: ${questions.questions.length}`);
            // Remove extra questions if too many (preserve only the first numOfQuestions)
            if (questions.length > sanitizedQuestions) {
                console.log(`Truncating questions from ${questions.length} to ${sanitizedQuestions}`);
                questions = questions.slice(0, sanitizedQuestions);
            }
            res.status(200).json({
                quiz: { title, description, userId: req.userId },
                noOfQuestions: questions.length,
                questions,
                creditsCharged: requiredCredits,
            });
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to generate quiz from Audio.' });
    }
};
exports.generateQuizByAudio = generateQuizByAudio;
const getQuizById = async (req, res) => {
    try {
        // requesterId (may be undefined) is populated by optionalAuth middleware when a valid token is provided
        const requesterId = req.userId;
        const { quizId } = req.query;
        const idNum = Number(quizId);
        if (!Number.isFinite(idNum)) {
            return res.status(400).json({ message: 'Invalid quizId parameter.' });
        }
        const quiz = await prisma_1.default.quiz.findUnique({
            where: { id: idNum },
            include: { questions: true },
        });
        if (!quiz) {
            return res.status(404).json({ status: false, message: 'Quiz not found.' });
        }
        const isOwner = requesterId === quiz.userId;
        // Owner always allowed
        if (isOwner) {
            return res.status(200).json({ status: true, isOwner, quiz });
        }
        // First: if quiz requires login, enforce authentication for non-owners
        if (quiz.requiresLogin) {
            if (!requesterId) {
                return res.status(401).json({ status: false, message: 'Authentication required to view this quiz.' });
            }
            // authenticated non-owner: continue to visibility check
        }
        // Then check visibility: if public -> allow, if private -> deny (even to authenticated non-owners)
        if (quiz.isPublic) {
            return res.status(200).json({ status: true, isOwner: false, quiz });
        }
        return res.status(403).json({ status: false, message: 'Quiz is private.' });
    }
    catch (error) {
        console.error('Error fetching quiz by ID:', error);
        res.status(500).json({ message: 'Failed to fetch quiz.' });
    }
};
exports.getQuizById = getQuizById;
