"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.CreateUserSchema = zod_1.default.object({
    firstName: zod_1.default.string().min(2).max(100),
    lastName: zod_1.default.string().min(2).max(100),
    username: zod_1.default.string().min(3).max(50),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6).max(100),
});
