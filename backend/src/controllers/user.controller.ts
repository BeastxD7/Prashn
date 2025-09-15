import { Request, Response } from "express";
import prisma from "../db/prisma";
import { safeParse } from "zod";
import { CreateUserSchema } from "../zodSchemas/user";



// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { data , error } = CreateUserSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const newUser = await prisma.user.create({
      data: { firstName: data.firstName, lastName: data.lastName, username: data.username, email: data.email },
    });
    res.status(201).json(newUser);
  } catch (error:any) {
    res.status(500).json({ message: 'Failed to create user', error:error.message});
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
