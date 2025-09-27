import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export interface CustomJwtPayload extends JwtPayload {
  userId: string;
}