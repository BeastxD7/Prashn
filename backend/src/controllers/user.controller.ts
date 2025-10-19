import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";
import { CreateUserSchema } from "../zodSchemas/user";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();



// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { data , error } = CreateUserSchema.safeParse(req.body);
    if (error) {
      console.log(error);
      return res.status(400).json({ status: false, error: error, message: 'Invalid user data' });
      
    }

    const { firstName, lastName, username, email, password } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { firstName, lastName, username, email, password: hashedPassword },
    });

    if (!newUser) {
      return res.status(400).json({ status: false, message: 'User creation failed' });
    }

    res.status(201).json({ status: true, message: 'User created successfully', user: newUser.username });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      // Unique constraint failed (e.g., username or email already exists)
      const target = (error.meta && (error.meta as any).target) || null;
      return res.status(409).json({ status: false, message: `User already exists with same ${target}`, details: target });
    }
    res.status(500).json({ status: false, message: 'Failed to create user', error: error.message });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ status: false, error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: false, error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.status(200).json({ status: true, message: 'Login successful', token });
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: false, error: 'Failed to login user' });
  }
};

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user by ID
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, username, email } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, username, email },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user by ID
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};


