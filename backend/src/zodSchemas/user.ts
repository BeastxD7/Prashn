import z from "zod";

export const CreateUserSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(100),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(8).max(100),
});

