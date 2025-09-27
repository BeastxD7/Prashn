import prisma from "../db/prisma";
import { creditRules, CreditRuleKey } from "../constants/credits";

export const checkAndDeductCredits = async (
    userId: string,
    requiredCredits: number
) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    });

    if (!user) {
        return false;
    }

    if (user.credits < requiredCredits) {
        return false;
    }

    await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: requiredCredits } },
    });

    return true;
};

export const getRequiredCreditsForQuestions = (
    generatorKey: CreditRuleKey,
    questionCount: number
): number => {
    const rule = creditRules[generatorKey];

    if (!rule || !rule.tiers.length) {
        throw new Error(`No credit rules configured for ${generatorKey}`);
    }

    const normalizedCount = Number.isFinite(questionCount) && questionCount > 0 ? questionCount : 1;

    for (const tier of rule.tiers) {
        if (normalizedCount <= tier.maxQuestions) {
            return tier.credits;
        }
    }

    // Fallback to last tier (should not be reached when Infinity is used)
    return rule.tiers[rule.tiers.length - 1].credits;
};
