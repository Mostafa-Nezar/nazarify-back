import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload { sub: string; role: "user" | "admin"; jti: string; iat: number; exp: number; }
export interface User extends Request { user?: JwtPayload; }

export const protectAny = (req: User, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token || req.headers.authorization?.startsWith("Bearer ")
      ? req.cookies?.token || req.headers.authorization!.split(" ")[1] : null;

  if (!token) return res.status(401).json({ message: "Authentication required" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.role !== "user" && decoded.role !== "admin") return res.status(403).json({ message: "Access denied" })

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
