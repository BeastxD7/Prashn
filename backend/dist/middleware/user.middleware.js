"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.cookieAuth = exports.headerAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const headerAuth = (req, res, next) => {
    try {
        console.log("Auth middleware called");
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.log(error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Unauthorized: Token expired' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.headerAuth = headerAuth;
const cookieAuth = (req, res, next) => {
    var _a;
    // First try cookie (typical for browser-based sessions)
    let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
    // Fallback: accept Authorization header too so local http frontends can send Bearer tokens
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }
    if (!token) {
        return res.status(401).json({ status: false, message: 'No token, authorization denied' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        res.status(401).json({ status: false, message: 'Token is not valid' });
    }
};
exports.cookieAuth = cookieAuth;
// Optional auth: if a valid token is present (cookie or Authorization header), set req.userId.
// If no token or token invalid, continue without failing (useful for public routes that may accept both
// authenticated and anonymous callers).
const optionalAuth = (req, res, next) => {
    var _a;
    try {
        let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }
        if (!token)
            return next();
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.userId) {
            req.userId = decoded.userId;
        }
        return next();
    }
    catch (err) {
        // Don't block the request on invalid token — treat as unauthenticated
        return next();
    }
};
exports.optionalAuth = optionalAuth;
