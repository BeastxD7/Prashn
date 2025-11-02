import * as z from "zod"

export const RegisterSchema = z.object({
    firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(32, "First name must be at most 32 characters."),
    lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters.")
    .max(32, "Last name must be at most 32 characters."),
  username: z
    .string()
    .min(5, "Username must be at least 5 characters.")
    .max(32, "Username must be at most 32 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be at most 100 characters."),
  email: z.string().email("Invalid email address."),
})