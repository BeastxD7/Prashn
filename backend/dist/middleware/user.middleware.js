"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth = (req, res, next) => {
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
exports.auth = auth;
