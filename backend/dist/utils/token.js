"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.hashToken = hashToken;
const crypto_1 = __importDefault(require("crypto"));
// Generate a cryptographically secure random token (URL-safe)
function generateToken(size = 64) {
    return crypto_1.default.randomBytes(size).toString('base64url');
}
// Hash the token using SHA-256 for storage/lookup
function hashToken(token) {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
}
