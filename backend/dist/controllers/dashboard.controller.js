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
        // Fetch and compile dashboard data based on userId
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
        const data = {
            credits: (dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.credits) || 0,
            features: publicFeatures,
        };
        res.status(200).json({ status: true, data: data });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};
exports.getDashboardData = getDashboardData;
