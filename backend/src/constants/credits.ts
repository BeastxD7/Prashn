export interface CreditTier {
    /** Maximum number of questions (inclusive) this tier covers. Use Infinity for open-ended upper bounds. */
    maxQuestions: number;
    /** Credits required when the requested questions fall within this tier. */
    credits: number;
}

export interface CreditRule {
    /** Styled tiers evaluated in order until a matching question count is found. */
    tiers: CreditTier[];
}

// New feature shape: each feature holds a friendly title and description plus the credit rule
export interface Feature {
    /** machine-friendly id for the feature */
    id: string;
    title: string;
    description: string;
    rule: CreditRule;
    image:string;
    route:string;
}

export type featureName =
    | "generateQuizByText"
    | "generateQuizByPdf"
    | "generateQuizByYoutube"
    | "generateQuizByAudio";


export const features: Feature[] = [
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
export const creditRules: Record<featureName, CreditRule> = features.reduce(
    (acc, f) => ({ ...acc, [f.id]: f.rule }),
    {} as Record<string, CreditRule>
) as Record<featureName, CreditRule>;
