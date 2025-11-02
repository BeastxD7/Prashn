import { Request, Response } from "express";
import prisma from "../db/prisma";
import { features } from "../constants/credits";

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        
        const dashboardData = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                credits: true,
            },
        });

        const publicFeatures = features.map((feature) => ({
            id: feature.id,
            title: feature.title,
            description: feature.description,
            tiers: feature.rule.tiers,
            route: feature.route,
            image: feature.image
        }));

        // Get top 3 most recent quizzes created by this user
        const recentQuizzes = await prisma.quiz.findMany({
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
        const totalQuizzes = await prisma.quiz.count({ where: { userId } });
        const totalQuestions = await prisma.question.count({ where: { quiz: { userId } } });

        const data = {
            credits: dashboardData?.credits || 0,
            features: publicFeatures,
            recentQuizzes,
            stats: {
                totalQuizzes,
                totalQuestions,
            },
        };


        res.status(200).json({ status: true, data: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};
