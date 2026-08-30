import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../models/user";
import NotificationService from "../../utils/notificationService";

const JWT_SECRET = process.env.JWT_SECRET!;
const createToken = (userId: string) =>
  jwt.sign({ sub: userId, role: "user", jti: crypto.randomUUID() }, JWT_SECRET, { expiresIn: "7d" });
const setcookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const githubLogin2 = async (req: Request, res: Response) => {
  const { platform } = req.query;
  const params = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID!,redirect_uri: process.env.GITHUB_CALLBACK_URL2!,scope: "read:user user:email",state: platform === 'web' ? 'web' : 'mobile', });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback2 = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ message: "GitHub code is required" });
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {method: "POST",headers: { Accept: "application/json" },
        body: new URLSearchParams({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          code: code as string,
        }),
      }
    );

    const { access_token } = await tokenResponse.json();
    if (!access_token) return res.status(401).json({message: "GitHub authentication failed",});
    const headers = {Authorization: `Bearer ${access_token}`,Accept: "application/vnd.github+json", "User-Agent": "Nazarify"};
    const githubUser = await (await fetch("https://api.github.com/user", { headers })).json();
    const emails = await (await fetch("https://api.github.com/user/emails", { headers })).json();
    const email = emails.find((e: any) => e.primary && e.verified)?.email || emails.find((e: any) => e.verified)?.email;

    if (!email) return res.status(400).json({message: "No verified GitHub email found"});

    let user = await User.findOne({email: email.toLowerCase()});
    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email: email.toLowerCase(),
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });
      await NotificationService.notifyWelcome(user._id.toString(), user.name);
    } else {
      if (!user.isActive) return res.status(403).json({message: "Account is disabled"});
      user.avatar = githubUser.avatar_url || user.avatar;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = createToken(user._id.toString());
    setcookie(res, token);
    if (state === 'web') {
      return res.redirect(`http://localhost:5000/auth.html?token=${encodeURIComponent(token)}`);
    } else {
      return res.redirect(`nazarify://auth/github?token=${encodeURIComponent(token)}`);
    }
  } catch (error) {
    console.error("GitHub login 2 error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const githubSignin = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    if (!code) return res.status(400).json({message: "GitHub authorization code is required",});
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token",
      { method: "POST",headers: {Accept: "application/json","Content-Type": "application/json",},body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET,code,
        }),
      }
    );
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return res.status(401).json({message: "Failed to authenticate with GitHub",});
    const githubResponse = await fetch("https://api.github.com/user", {headers: { Authorization: `Bearer ${tokenData.access_token}`,Accept: "application/vnd.github+json"}});
    const githubUser = await githubResponse.json();
    let email = githubUser.email;
    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {headers: {Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json"}});
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((item: { primary: boolean; verified: boolean; email: string }) => item.primary && item.verified);
      email = primaryEmail?.email;
    }

    if (!email) return res.status(400).json({message: "GitHub account has no verified email"});

    email = email.toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: githubUser.name || githubUser.login,
        email,
        username: githubUser.login,
        githubId: String(githubUser.id),
        avatar: githubUser.avatar_url,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });

      await user.save();
      await NotificationService.notifyWelcome(user._id.toString(), user.name);
    } else {
      if (!user.githubId) user.githubId = String(githubUser.id);
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });
    const token = createToken(user._id.toString());
    setcookie(res, token);
    return res.status(200).json({ user, token, message: "GitHub login successful" });
  } catch (error) {
    console.error("GitHub signin error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
