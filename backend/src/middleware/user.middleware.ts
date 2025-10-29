import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CustomJwtPayload } from "../types/user";

dotenv.config();



export const headerAuth =  (req: Request, res: Response , next:NextFunction) => {
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.userId = decoded.userId;

        next();

    } catch (error) {
        console.log(error);

        if(error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        if(error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Unauthorized: Token expired' });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const cookieAuth = (req: Request, res: Response, next: NextFunction) => {
  // First try cookie (typical for browser-based sessions)
  let token = req.cookies?.access_token;

  // Fallback: accept Authorization header too so local http frontends can send Bearer tokens
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ status: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ status: false, message: 'Token is not valid' });
  }
};

// Optional auth: if a valid token is present (cookie or Authorization header), set req.userId.
// If no token or token invalid, continue without failing (useful for public routes that may accept both
// authenticated and anonymous callers).
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.access_token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
    }
    return next();
  } catch (err) {
    // Don't block the request on invalid token — treat as unauthenticated
    return next();
  }
};