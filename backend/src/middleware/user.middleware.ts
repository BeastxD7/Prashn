import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CustomJwtPayload } from "../types/user";

dotenv.config();



export const auth =  (req: Request, res: Response , next:NextFunction) => {
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