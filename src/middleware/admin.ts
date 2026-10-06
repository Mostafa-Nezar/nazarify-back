import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload { sub: string; role: "admin"; jti: string; iat: number; exp: number; }

export const protectAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.admin_token || (req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null);

  if (!token) return res.status(401).json({ message: "Authentication required" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const admin = await Admin.findById(decoded.sub).select("isActive");
    if (!admin || !admin.isActive) return res.status(403).json({ message: "Account is disabled" });

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
