import { Request, Response } from "express";
import prisma from "../db/prisma";
import { features } from "../constants/credits";

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        // Fetch and compile dashboard data based on userId
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

        const data = {
            credits: dashboardData?.credits || 0,
            features: publicFeatures,
        };


        res.status(200).json({ status: true, data: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};
