"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const credits_1 = require("../constants/credits");
const getDashboardData = async (req, res) => {
    try {
        const userId = req.userId;
        const dashboardData = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                credits: true,
            },
        });
        const publicFeatures = credits_1.features.map((feature) => ({
            id: feature.id,
            title: feature.title,
            description: feature.description,
            tiers: feature.rule.tiers,
            route: feature.route,
            image: feature.image
        }));
        // Get top 3 most recent quizzes created by this user
        const recentQuizzes = await prisma_1.default.quiz.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        });
        // Compute stats: total quizzes and total questions created by this user
        const totalQuizzes = await prisma_1.default.quiz.count({ where: { userId } });
        const totalQuestions = await prisma_1.default.question.count({ where: { quiz: { userId } } });
        const data = {
            credits: (dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.credits) || 0,
            features: publicFeatures,
            recentQuizzes,
            stats: {
                totalQuizzes,
                totalQuestions,
            },
        };
        res.status(200).json({ status: true, data: data });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};
exports.getDashboardData = getDashboardData;
