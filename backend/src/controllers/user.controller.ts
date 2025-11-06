import { Request, Response } from "express";
import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";
import { ChangePasswordSchema, CreateUserSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../zodSchemas/user";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { generateToken, hashToken } from "../utils/token";
import { sendPasswordResetEmail } from "../utils/email";

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

  // Use configurable bcrypt salt rounds (default 12). Prefer >=12 for production.
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const hashedPassword = await bcrypt.hash(password, saltRounds);

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
    // Basic input validation (use Zod for stricter validation if desired)
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ status: false, message: 'Invalid credentials format' });
    }
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ status: false, message: "No user found with the given Credentials!", error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: false, message: "username or password is incorrect", error: 'Invalid password' });
    }

    // Short-lived access token: prefer small lifetime (e.g. 15 minutes). Make configurable in env.
    const accessTokenExpirySeconds = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_SECONDS || '900', 10); // default 900s = 15m
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: `${accessTokenExpirySeconds}s` });

    const isProd = process.env.NODE_ENV === 'production';

    // Cookie options for access token. Keep HttpOnly to prevent JS access.
    const accessCookieOptions = {
      httpOnly: true,
      secure: isProd,
      domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: accessTokenExpirySeconds * 1000,
      path: '/',
    } as const;

    // Store the access token in an HttpOnly cookie. NOTE: because cookies are being used for auth,
    // you must also protect against CSRF (double-submit cookie, CSRF tokens, or use SameSite strict where possible).
    res.cookie('access_token', token, accessCookieOptions);

    // Create a long-lived refresh token, store its hash in DB and set cookie
    const refreshTokenExpirySeconds = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_SECONDS || `${14 * 24 * 60 * 60}`, 10); // default 14 days
    const refreshToken = generateToken(64);
    const refreshTokenHash = hashToken(refreshToken);

    // Persist hashed refresh token
    await (prisma as any).refreshToken.create({
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
      domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: refreshTokenExpirySeconds * 1000,
      path: '/',
    });

    // Don't echo the JWT back in the JSON response. This prevents accidental exposure in client-side logs.
    res.status(200).json({ status: true, message: 'Login successful' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: false,message:"Something went wrong | Server Error",  error: 'Failed to login user' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  // Clear authentication cookies on logout. Also revoke server-side refresh token if present.
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = { httpOnly: true, secure: isProd, domain: isProd ? process.env.COOKIE_DOMAIN : undefined, sameSite: isProd ? 'none' : 'lax', path: '/' } as const;

  const presentedRefresh = req.cookies?.refresh_token;
  if (presentedRefresh && typeof presentedRefresh === 'string') {
    try {
      const presentedHash = hashToken(presentedRefresh);
      // Mark this token revoked in DB (if it exists)
      await (prisma as any).refreshToken.updateMany({ where: { tokenHash: presentedHash }, data: { revoked: true } });
    } catch (e) {
      // still clear cookies below
      console.log('Failed to revoke refresh token on logout', e);
    }
  }

  // Overwrite and expire the cookies
  res.cookie('access_token', '', { ...cookieOptions, maxAge: 0 });
  res.cookie('refresh_token', '', { ...cookieOptions, maxAge: 0 });

  res.json({ status: true, message: 'Logged out successfully' });
};

// Refresh access token using a refresh token stored in HttpOnly cookie.
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const presented = req.cookies?.refresh_token;
    if (!presented || typeof presented !== 'string') {
      // Return 204 No Content to signal "no refresh possible" - prevents client retry loops
      return res.status(204).set('X-Refresh-Available', 'false').end();
    }

    const presentedHash = hashToken(presented);
    const stored = await (prisma as any).refreshToken.findUnique({ where: { tokenHash: presentedHash } });
    if (!stored || stored.revoked || new Date(stored.expiresAt) < new Date()) {
      // Possible token reuse/compromise: revoke all tokens for that user if we have the record
      if (stored && stored.userId) {
        await (prisma as any).refreshToken.updateMany({ where: { userId: stored.userId }, data: { revoked: true } });
      }
      return res.status(401).json({ status: false, message: 'Invalid or expired refresh token' });
    }

    // Rotate refresh token: replace stored tokenHash and expiry
    const newRefreshToken = generateToken(64);
    const newRefreshHash = hashToken(newRefreshToken);
    const refreshTokenExpirySeconds = parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRES_SECONDS || `${14 * 24 * 60 * 60}`, 10);

    await (prisma as any).refreshToken.update({ where: { tokenHash: presentedHash }, data: { tokenHash: newRefreshHash, expiresAt: new Date(Date.now() + refreshTokenExpirySeconds * 1000) } });

    // Issue new short-lived access token
    const accessTokenExpirySeconds = parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_SECONDS || '900', 10);
    const newAccessToken = jwt.sign({ userId: stored.userId }, process.env.JWT_SECRET!, { expiresIn: `${accessTokenExpirySeconds}s` });

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', newAccessToken, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', domain: isProd ? process.env.COOKIE_DOMAIN : undefined, maxAge: accessTokenExpirySeconds * 1000, path: '/' });
    res.cookie('refresh_token', newRefreshToken, { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', domain: isProd ? process.env.COOKIE_DOMAIN : undefined, maxAge: refreshTokenExpirySeconds * 1000, path: '/' });

    res.status(200).json({ status: true, message: 'Token refreshed' });
  } catch (error) {
    console.log('refreshAccessToken error', error);
    res.status(500).json({ status: false, message: 'Failed to refresh token' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const safeResponse = { status: true, message: 'If an account exists for that email, we have sent reset instructions.' } as const;

  try {
    const { data, error } = ForgotPasswordSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: 'Invalid email address supplied.' });
    }

    const email = data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json(safeResponse);
    }

    // Remove expired tokens to keep table tidy
  await (prisma as any).passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        OR: [{ expiresAt: { lt: new Date() } }, { used: true }],
      },
    });

    const rawToken = generateToken(48);
    const hashedToken = hashToken(rawToken);
    const ttlMinutes = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES || '30', 10);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await (prisma as any).passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedToken,
        expiresAt,
      },
    });

    await sendPasswordResetEmail({ to: user.email, token: rawToken, userName: user.firstName });

    return res.status(200).json(safeResponse);
  } catch (error) {
    console.error('forgotPassword error', error);
    return res.status(200).json(safeResponse);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { data, error } = ResetPasswordSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: 'Invalid reset payload.' });
    }

    const hashedToken = hashToken(data.token);
  const resetRecord = await (prisma as any).passwordResetToken.findUnique({ where: { tokenHash: hashedToken } });

    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ status: false, message: 'Reset token is invalid or expired.' });
    }

    const user = await prisma.user.findUnique({ where: { id: resetRecord.userId } });
    if (!user) {
      return res.status(400).json({ status: false, message: 'Reset token is invalid.' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
  (prisma as any).passwordResetToken.update({
        where: { tokenHash: hashedToken },
        data: { used: true, usedAt: new Date() },
      }),
  (prisma as any).passwordResetToken.deleteMany({
        where: { userId: user.id, used: false },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    return res.status(200).json({ status: true, message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    console.error('resetPassword error', error);
    return res.status(500).json({ status: false, message: 'Failed to reset password.' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    const { data, error } = ChangePasswordSchema.safeParse(req.body);
    if (error) {
      return res.status(400).json({ status: false, message: 'Invalid password change payload.' });
    }

    if (data.currentPassword === data.newPassword) {
      return res.status(400).json({ status: false, message: 'New password must be different from current password.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: false, message: 'Current password is incorrect.' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      }),
  (prisma as any).passwordResetToken.deleteMany({ where: { userId } }),
    ]);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    } as const;

    res.cookie('access_token', '', { ...cookieOptions, maxAge: 0 });
    res.cookie('refresh_token', '', { ...cookieOptions, maxAge: 0 });

    return res.status(200).json({ status: true, message: 'Password updated. Please log in again.' });
  } catch (error) {
    console.error('changePassword error', error);
    return res.status(500).json({ status: false, message: 'Failed to change password.' });
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


export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
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

export const getUserCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    res.status(200).json({ status: true, credits: user.credits });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: 'Failed to fetch user credits' });
  }
};
