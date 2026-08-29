import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../../models/admin";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

export const googlelogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Google token is required" });

        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        if (!payload?.email || !payload.sub) return res.status(400).json({ message: "Invalid Google token" });

        const email = payload.email.toLowerCase();
        let admin = await Admin.findOne({ email });
        if (!admin) admin = await Admin.findOne({ googleId: payload.sub });

        if (!admin) {
            admin = new Admin({
                name: payload.name || "Google Admin",
                email,
                googleId: payload.sub,
                avatar: payload.picture,
                isEmailVerified: true,
                lastLoginAt: new Date(),
            });
        } else {
            if (!admin.isActive) return res.status(403).json({ message: "Account is disabled" });

            admin.googleId = payload.sub;
            if (payload.picture) admin.avatar = payload.picture;
            admin.isEmailVerified = true;
            admin.lastLoginAt = new Date();
        }

        await admin.save();

        const jwtToken = createToken(admin._id.toString(), admin.role);
        setcookie(res, jwtToken);
        res.setHeader("Authorization", `Bearer ${jwtToken}`);
        return res.status(200).json({ admin, token: jwtToken, message: "Google login successful" });
    } catch (error) {
        console.error("Google admin login error:", error instanceof Error ? error.message : error);
        return res.status(500).json({ message: "server error" });
    }
};

export const githubLogin = async (_req: Request, res: Response) => {
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: process.env.GITHUB_ADMIN_CALLBACK_URL!,
        scope: "read:user user:email",
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback = async (req: Request, res: Response) => {
    try {
        const { code } = req.query;
        if (!code) return res.status(400).json({ message: "GitHub code is required" });

        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new URLSearchParams({
                client_id: process.env.GITHUB_CLIENT_ID!,
                client_secret: process.env.GITHUB_CLIENT_SECRET!,
                code: code as string,
            }),
        });
        const { access_token } = await tokenResponse.json();

        if (!access_token) return res.status(401).json({ message: "GitHub authentication failed" });

        const githubResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "Nazarify",
            },
        });
        const githubUser = await githubResponse.json();

        const emailsResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "Nazarify",
            },
        });
        const emails = await emailsResponse.json();
        const email = emails.find((item: any) => item.primary && item.verified)?.email
            || emails.find((item: any) => item.verified)?.email;
        if (!email) return res.status(400).json({ message: "No verified GitHub email found" });

        const githubId = String(githubUser.id);
        let admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) admin = await Admin.findOne({ githubId });
        if (!admin) {
            admin = await Admin.create({
                name: githubUser.name || githubUser.login,
                email: email.toLowerCase(),
                githubId,
                avatar: githubUser.avatar_url,
                isEmailVerified: true,
                lastLoginAt: new Date(),
            });
        } else {
            if (!admin.isActive) return res.status(403).json({ message: "Account is disabled" });

            admin.githubId = githubId;
            admin.avatar = githubUser.avatar_url || admin.avatar;
            admin.isEmailVerified = true;
            admin.lastLoginAt = new Date();
            await admin.save();
        }

        const jwtToken = createToken(admin._id.toString(), admin.role);
        setcookie(res, jwtToken);
        res.setHeader("Authorization", `Bearer ${jwtToken}`);
        const frontendUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:3000/login";
        return res.redirect(`${frontendUrl}?token=${encodeURIComponent(jwtToken)}`);
    } catch (error) {
        console.error("GitHub admin login error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const logout = async (_req: Request, res: Response) => {
    clearcookie(res);
    return res.status(200).json({ message: "Logout successful" });
};
