import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../models/user";
import NotificationService from "../../utils/notificationService";

const JWT_SECRET = process.env.JWT_SECRET!;

const createToken = (userId: string) => jwt.sign({ sub: userId, role: "user", jti: crypto.randomUUID() }, JWT_SECRET, { expiresIn: "7d" });

const setcookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearcookie = (res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
    });

    await NotificationService.notifyWelcome(user._id.toString(), user.name);

    const token = createToken(user._id.toString());
    setcookie(res, token);
    return res.status(201).json({ user, token, message: "Registration successful" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    setcookie(res, createToken(user._id.toString()));

    return res.status(200).json({ user, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) return res.status(400).json({ message: "Google email is required" });

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name: name?.trim() || "Google User",
        email: normalizedEmail,
        avatar: avatar?.trim(),
        isEmailVerified: true,
      });
      isNewUser = true;
    } else {
      if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });
      if (avatar && !user.avatar) user.avatar = avatar.trim();

      user.isEmailVerified = true;
      user.lastLoginAt = new Date();

      await user.save();
    }

    setcookie(res, createToken(user._id.toString()));

    if (isNewUser) {
      await NotificationService.notifyWelcome(user._id.toString(), user.name);
    }

    return res.status(200).json({ message: "Google login successful", user });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  clearcookie(res);
  return res.status(200).json({ message: "Logout successful" });
};
