"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCredits = exports.getProfile = exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getAllUsers = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const client_1 = require("@prisma/client");
const user_1 = require("../zodSchemas/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_1 = require("../utils/token");
dotenv_1.default.config();
// Create a new user
const createUser = async (req, res) => {
    try {
        const { data, error } = user_1.CreateUserSchema.safeParse(req.body);
        if (error) {
            console.log(error);
            return res.status(400).json({ status: false, error: error, message: 'Invalid user data' });
        }
        const { firstName, lastName, username, email, password } = data;
        // Use configurable bcrypt salt rounds (default 12). Prefer >=12 for production.
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const newUser = await prisma_1.default.user.create({
            data: { firstName, lastName, username, email, password: hashedPassword },
        });
        if (!newUser) {
            return res.status(400).json({ status: false, message: 'User creation failed' });
        }
        res.status(201).json({ status: true, message: 'User created successfully', user: newUser.username });
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // Unique constraint failed (e.g., username or email already exists)
            const target = (error.meta && error.meta.target) || null;
            return res.status(409).json({ status: false, message: `User already exists with same ${target}`, details: target });
        }
        res.status(500).json({ status: false, message: 'Failed to create user', error: error.message });
    }
};
exports.createUser = createUser;
const loginUser = async (req, res) => {
    try {
        // Basic input validation (use Zod for stricter validation if desired)
        const { username, password } = req.body || {};
        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ status: false, message: 'Invalid credentials format' });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { username },
        });
        if (!user) {
            return res.status(404).json({ status: false, message: "No user found with the given Credentials!", error: 'User not found' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: "username or password is incorrect", error: 'Invalid password' });
        }
        // Short-lived access token: prefer small lifetime (e.g. 15 minutes). Make configurable in env.
        const accessTokenExpirySeconds = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_SECONDS || '900', 10); // default 900s = 15m
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: `${accessTokenExpirySeconds}s` });
        const isProd = process.env.NODE_ENV === 'production';
        // Cookie options for access token. Keep HttpOnly to prevent JS access.
        const accessCookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: accessTokenExpirySeconds * 1000,
            path: '/',
        };
        // Store the access token in an HttpOnly cookie. NOTE: because cookies are being used for auth,
        // you must also protect against CSRF (double-submit cookie, CSRF tokens, or use SameSite strict where possible).
        res.cookie('access_token', token, accessCookieOptions);
        // Create a long-lived refresh token, store its hash in DB and set cookie
        const refreshTokenExpirySeconds = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_SECONDS || `${14 * 24 * 60 * 60}`, 10); // default 14 days
        const refreshToken = (0, token_1.generateToken)(64);
        const refreshTokenHash = (0, token_1.hashToken)(refreshToken);
        // Persist hashed refresh token
        await prisma_1.default.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                userId: user.id,
                expiresAt: new Date(Date.now() + refreshTokenExpirySeconds * 1000),
            },
        });
        // Set refresh token cookie (HttpOnly)
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: refreshTokenExpirySeconds * 1000,
            path: '/',
        });
        // Don't echo the JWT back in the JSON response. This prevents accidental exposure in client-side logs.
        res.status(200).json({ status: true, message: 'Login successful' });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Something went wrong | Server Error", error: 'Failed to login user' });
    }
};
exports.loginUser = loginUser;
const logoutUser = async (req, res) => {
    var _a;
    // Clear authentication cookies on logout. Also revoke server-side refresh token if present.
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' };
    const presentedRefresh = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
    if (presentedRefresh && typeof presentedRefresh === 'string') {
        try {
            const presentedHash = (0, token_1.hashToken)(presentedRefresh);
            // Mark this token revoked in DB (if it exists)
            await prisma_1.default.refreshToken.updateMany({ where: { tokenHash: presentedHash }, data: { revoked: true } });
        }
        catch (e) {
            // still clear cookies below
            console.log('Failed to revoke refresh token on logout', e);
        }
    }
    // Overwrite and expire the cookies
    res.cookie('access_token', '', Object.assign(Object.assign({}, cookieOptions), { maxAge: 0 }));
    res.cookie('refresh_token', '', Object.assign(Object.assign({}, cookieOptions), { maxAge: 0 }));
    res.json({ status: true, message: 'Logged out successfully' });
};
exports.logoutUser = logoutUser;
// Refresh access token using a refresh token stored in HttpOnly cookie.
const refreshAccessToken = async (req, res) => {
    var _a;
    try {
        const presented = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
        if (!presented || typeof presented !== 'string') {
            return res.status(401).json({ status: false, message: 'No refresh token provided' });
        }
        const presentedHash = (0, token_1.hashToken)(presented);
        const stored = await prisma_1.default.refreshToken.findUnique({ where: { tokenHash: presentedHash } });
        if (!stored || stored.revoked || new Date(stored.expiresAt) < new Date()) {
            // Possible token reuse/compromise: revoke all tokens for that user if we have the record
            if (stored && stored.userId) {
                await prisma_1.default.refreshToken.updateMany({ where: { userId: stored.userId }, data: { revoked: true } });
            }
            return res.status(401).json({ status: false, message: 'Invalid or expired refresh token' });
        }
        // Rotate refresh token: replace stored tokenHash and expiry
        const newRefreshToken = (0, token_1.generateToken)(64);
        const newRefreshHash = (0, token_1.hashToken)(newRefreshToken);
        const refreshTokenExpirySeconds = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_SECONDS || `${14 * 24 * 60 * 60}`, 10);
        await prisma_1.default.refreshToken.update({ where: { tokenHash: presentedHash }, data: { tokenHash: newRefreshHash, expiresAt: new Date(Date.now() + refreshTokenExpirySeconds * 1000) } });
        // Issue new short-lived access token
        const accessTokenExpirySeconds = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_SECONDS || '900', 10);
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: stored.userId }, process.env.JWT_SECRET, { expiresIn: `${accessTokenExpirySeconds}s` });
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('access_token', newAccessToken, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', maxAge: accessTokenExpirySeconds * 1000, path: '/' });
        res.cookie('refresh_token', newRefreshToken, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', maxAge: refreshTokenExpirySeconds * 1000, path: '/' });
        res.status(200).json({ status: true, message: 'Token refreshed' });
    }
    catch (error) {
        console.log('refreshAccessToken error', error);
        res.status(500).json({ status: false, message: 'Failed to refresh token' });
    }
};
exports.refreshAccessToken = refreshAccessToken;
// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.params.id },
        });
        if (user)
            res.json(user);
        else
            res.status(404).json({ error: 'User not found' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.getUserById = getUserById;
// Update user by ID
const updateUserById = async (req, res) => {
    try {
        const { firstName, lastName, username, email } = req.body;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: req.params.id },
            data: { firstName, lastName, username, email },
        });
        res.json(updatedUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};
exports.updateUserById = updateUserById;
// Delete user by ID
const deleteUserById = async (req, res) => {
    try {
        await prisma_1.default.user.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
exports.deleteUserById = deleteUserById;
// export const getProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = req.userId;
//     console.log(userId);
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         firstName: true,
//         lastName: true,
//         username: true,
//         email: true,
//         createdAt: true,
//       },
//     });
//     console.log(user);
//     if (!user) {
//       console.log("user: ",user);
//       console.log("userId: ",userId);
//       return res.status(404).json({ status: false, message: 'User not found' });
//     }
//     res.status(200).json({ status: true, user });
//   }
//   catch (error) {
//     console.log(error);
//     res.status(500).json({ status: false, message: 'Failed to fetch profile' });
//   }
// };
const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.status(200).json({ status: true, user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: 'Failed to fetch profile' });
    }
};
exports.getProfile = getProfile;
const getUserCredits = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.status(200).json({ status: true, credits: user.credits });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: 'Failed to fetch user credits' });
    }
};
exports.getUserCredits = getUserCredits;
