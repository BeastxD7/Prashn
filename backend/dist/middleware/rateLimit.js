"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetRateLimiter = exports.authRateLimiter = exports.generalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const windowMsDefault = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxRequestsDefault = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 300);
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: windowMsDefault,
    max: maxRequestsDefault,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: "Too many requests, please try again later.",
    },
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_AUTH_MAX || 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: "Too many login attempts, please try again later.",
    },
});
exports.passwordResetRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_PASSWORD_RESET_MAX || 5),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: "Too many password reset attempts, please try again later.",
    },
});
