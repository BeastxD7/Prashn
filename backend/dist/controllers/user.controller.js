"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserCredits = exports.getProfile = exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getAllUsers = exports.logoutUser = exports.loginUser = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const client_1 = require("@prisma/client");
const user_1 = require("../zodSchemas/user");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
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
        const { username, password } = req.body;
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        const isProd = process.env.NODE_ENV === 'production';
        // Set token as HttpOnly cookie. In production we use secure + sameSite none (for cross-site https).
        // For local development (http) we must avoid secure:true so the browser will accept the cookie.
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: 60 * 60 * 1000,
            path: '/',
        });
        res.status(200).json({ status: true, message: 'Login successful', token });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Something went wrong | Server Error", error: 'Failed to login user' });
    }
};
exports.loginUser = loginUser;
const logoutUser = (_req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', '', { maxAge: 0, httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
    res.json({ status: true, message: 'Logged out successfully' });
};
exports.logoutUser = logoutUser;
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
