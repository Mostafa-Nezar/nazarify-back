import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/admin";

const JWT_SECRET = process.env.JWT_SECRET!;
const createToken = (adminId: string, role: string) => jwt.sign({ sub: adminId, role, jti: crypto.randomUUID() }, JWT_SECRET, { expiresIn: "1d" });
const setcookie = (res: Response, token: string) => {
  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const clearcookie = (res: Response) => { res.clearCookie("admin_token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" }) };

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) { return res.status(400).json({ message: "All fields are required" }); }
    if (await Admin.findOne({ email })) return res.status(409).json({ message: "Email already registered" });
    const admin = await Admin.create({ name: name.trim(), email, password: await bcrypt.hash(password, 12) });

    const token = createToken(admin._id.toString(), admin.role);
    setcookie(res, token);
    res.setHeader("Authorization", `Bearer ${token}`);
    return res.status(201).json({ admin, token, message: "Registration successful" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!admin || !admin.password) return res.status(401).json({ message: "Invalid email or password" });
    if (!admin.isActive) return res.status(403).json({ message: "Account is disabled" });
    if (!(await bcrypt.compare(password, admin.password))) return res.status(401).json({ message: "Invalid email or password" });

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = createToken(admin._id.toString(), admin.role);
    setcookie(res, token);
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).json({ admin, token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  clearcookie(res);
  return res.status(200).json({ message: "Logout successful" });
};
