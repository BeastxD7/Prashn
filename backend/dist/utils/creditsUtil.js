"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundCredits = exports.getRequiredCreditsForQuestions = exports.checkAndDeductCredits = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const credits_1 = require("../constants/credits");
const checkAndDeductCredits = async (userId, requiredCredits) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    });
    if (!user) {
        return false;
    }
    if (user.credits < requiredCredits) {
        return false;
    }
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { credits: { decrement: requiredCredits } },
    });
    return true;
};
exports.checkAndDeductCredits = checkAndDeductCredits;
const getRequiredCreditsForQuestions = (generatorKey, questionCount) => {
    const rule = credits_1.creditRules[generatorKey];
    if (!rule || !rule.tiers || !rule.tiers.length) {
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
exports.getRequiredCreditsForQuestions = getRequiredCreditsForQuestions;
const refundCredits = async (userId, credits) => {
    try {
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { credits: { increment: credits } },
        });
    }
    catch (error) {
        console.error('Error refunding credits:', error);
    }
};
exports.refundCredits = refundCredits;
