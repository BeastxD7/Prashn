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

export type CreditRuleKey =
    | "generateQuizByText"
    | "generateQuizByPdf"
    | "generateQuizByYoutube"
    | "generateQuizByAudio";

export const creditRules: Record<CreditRuleKey, CreditRule> = {
    generateQuizByText: {
        tiers: [
            { maxQuestions: 5, credits: 1 },
            { maxQuestions: 15, credits: 2 },
            { maxQuestions: 30, credits: 3 }
        ],
    },
    generateQuizByPdf: {
        tiers: [
            { maxQuestions: 5, credits: 2 },
            { maxQuestions: 15, credits: 3 },
            { maxQuestions: 30, credits: 4 },
        ],
    },
    generateQuizByYoutube: {
        tiers: [
            { maxQuestions: 5, credits: 2 },
            { maxQuestions: 15, credits: 3 },
            { maxQuestions: 30, credits: 4 },
        ],
    },
    generateQuizByAudio: {
        tiers: [
            { maxQuestions: 5, credits: 2 },
            { maxQuestions: 15, credits: 3 },
            { maxQuestions: 30, credits: 4 },
        ],
    },
};