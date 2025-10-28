"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditRules = exports.features = void 0;
exports.features = [
    {
        id: 'generateQuizByText',
        title: "Generate Quiz from Text",
        description: "Create a quiz based on pasted or submitted text input.",
        route: "/generateQuizByText",
        image: "https://images.unsplash.com/photo-1663970206579-c157cba7edda?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbHBhcGVyJTIwZm9yJTIwcGN8ZW58MHx8MHx8fDA%3D&fm=jpg&q=60&w=3000",
        rule: {
            tiers: [
                { maxQuestions: 5, credits: 1 },
                { maxQuestions: 15, credits: 2 },
                { maxQuestions: 30, credits: 3 },
            ],
        },
    },
    {
        id: 'generateQuizByPdf',
        title: "Generate Quiz from PDF",
        description: "Extract content from a PDF and generate quiz questions.",
        route: "/generateQuizByPdf",
        image: "https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvdjEwNzItMDM3LWMta3ZoaDA4bXAuanBn.jpg",
        rule: {
            tiers: [
                { maxQuestions: 5, credits: 2 },
                { maxQuestions: 15, credits: 3 },
                { maxQuestions: 30, credits: 4 },
            ],
        },
    },
    {
        id: 'generateQuizByYoutube',
        title: "Generate Quiz from YouTube",
        description: "Generate quiz questions using a YouTube video's transcript.",
        route: "/generateQuizByYoutube",
        image: "https://img.freepik.com/free-vector/3d-abstract-background-pink-gradient-liquid-shapes-vector_53876-156661.jpg",
        rule: {
            tiers: [
                { maxQuestions: 5, credits: 2 },
                { maxQuestions: 15, credits: 3 },
                { maxQuestions: 30, credits: 4 },
            ],
        },
    },
    {
        id: 'generateQuizByAudio',
        title: "Generate Quiz from Audio",
        description: "Transcribe audio and create quiz questions from the transcript.",
        route: "/generateQuizByAudio",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/7658.jpg",
        rule: {
            tiers: [
                { maxQuestions: 5, credits: 2 },
                { maxQuestions: 15, credits: 3 },
                { maxQuestions: 30, credits: 4 },
            ],
        },
    },
];
// Compatibility helper: expose a 'creditRules' view that returns the old shape (Record<featureName, CreditRule>)
exports.creditRules = exports.features.reduce((acc, f) => (Object.assign(Object.assign({}, acc), { [f.id]: f.rule })), {});
