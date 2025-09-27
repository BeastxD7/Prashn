"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.updateUserById = exports.getUserById = exports.getAllUsers = exports.loginUser = exports.createUser = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
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
            return res.status(400).json({ error: error.message });
        }
        const { firstName, lastName, username, email, password } = data;
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.default.user.create({
            data: { firstName, lastName, username, email, password: hashedPassword },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create user', error: error.message });
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
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to login user' });
    }
};
exports.loginUser = loginUser;
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
