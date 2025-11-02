"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndDeductCredits = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const checkAndDeductCredits = async (userId, requiredCredits) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { credits: true, username: true }
    });
    if (!user) {
        return false;
    }
    console.log("User Found in checkAndDeductCredits fn: ", user);
    if (user.credits < requiredCredits) {
        return false;
    }
    console.log(`User has enough credits: ${user.credits}, required: ${requiredCredits}`);
    console.log(`Deducting credits of user: ${user.username} by ${requiredCredits} `);
    await prisma_1.default.user.update({
        where: { id: userId },
        data: { credits: { decrement: requiredCredits } }
    });
    console.log("Credits after deduction: ", user.credits);
    return true;
};
exports.checkAndDeductCredits = checkAndDeductCredits;
