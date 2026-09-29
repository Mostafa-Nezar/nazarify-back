import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User, { IUser } from "../../models/user";
import NotificationService from "../../utils/notificationService";
import { OAuth2Client } from "google-auth-library";
import { verifyRecaptcha } from "../../utils/recaptcha"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET!;
const createToken = (userId: string) => jwt.sign({ sub: userId, role: "user", jti: crypto.randomUUID() }, JWT_SECRET, { expiresIn: "7d" });
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = { httpOnly: true, secure: isProduction, sameSite: (isProduction ? "none" : "lax") as "none" | "lax", maxAge: 7 * 24 * 60 * 60 * 1000, };

const populateNotifications = async (user: IUser) => user.populate("notifications");
const setcookie = (res: Response, token: string) => res.cookie("token", token, cookieOptions);
const clearcookie = (res: Response) => res.clearCookie("token", cookieOptions);

export const register = async (req: Request, res: Response) => {
  try {
    const captcha = await verifyRecaptcha(req.body.captchaToken);
    if (!captcha.success || captcha.score < 0.5 || captcha.action !== "register") return res.status(400).json({ message: "Captcha verification failed" });
  
    const { name, email, password, phone, fcmToken } = req.body;
    if (!name || !email || !password) { return res.status(400).json({ message: "All fields are required" }); }
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), password: await bcrypt.hash(password, 12), phone: phone?.trim(), ...(fcmToken && { fcmTokens: [fcmToken] }) });
    await NotificationService.notifyWelcome(user._id.toString(), user.name);
    await populateNotifications(user);

    const token = createToken(user._id.toString());
    setcookie(res, token);
    return res.status(201).json({ user, token, message: "Registration successful" });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const captcha = await verifyRecaptcha(req.body.captchaToken);
    if (!captcha.success || captcha.score < 0.5 || captcha.action !== "login") return res.status(400).json({ message: "Captcha verification failed" });
    
    const { email, password, fcmToken } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select("+password +fcmTokens")
      .populate("notifications");
    if (!user || !user.password) return res.status(401).json({ message: "Invalid email or password" });
    if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });

    if (fcmToken) {
      if (!user.fcmTokens) user.fcmTokens = [];
      if (!user.fcmTokens.includes(fcmToken)) {
        user.fcmTokens = [...user.fcmTokens, fcmToken];
      }
    }
    user.lastLoginAt = new Date();
    await user.save();

    const token = createToken(user._id.toString());
    setcookie(res, token);

    return res.status(200).json({ user, token, message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) return res.status(400).json({ message: "Invalid Google token" });
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) user = await User.findOne({ googleId });

    if (!user) {
      user = new User({
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });

      await user.save();
      await NotificationService.notifyWelcome(user._id.toString(), user.name);
    } else {
      if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });

      user.googleId = googleId;
      user.lastLoginAt = new Date();
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    await populateNotifications(user);
    const jwtToken = createToken(user._id.toString());
    setcookie(res, jwtToken);
    return res.status(200).json({ user, token: jwtToken, message: "Google login successful" });
  } catch (err: any) {
    console.error("❌ Google signin error:", err);
    return res.status(500).json({ message: "server error" });
  }
};

export const googleAuthLogin = async (_req: Request, res: Response) => {
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: process.env.GOOGLE_CALLBACK_URL!, response_type: "code", scope: "openid email profile", });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) return res.status(400).json({ message: "Google code is required" });
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.id_token) return res.status(401).json({ message: "Google authentication failed" });
    const ticket = await client.verifyIdToken({ idToken: tokenData.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) return res.status(400).json({ message: "Invalid Google token data" });
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) user = await User.findOne({ googleId });

    if (!user) {
      const newUserData = {
        name: name || "Google User",
        email: email.toLowerCase(),
        googleId,
        avatar: picture,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      };
      user = new User(newUserData);
      await user.save();
      await NotificationService.notifyWelcome(user._id.toString(), user.name);
    } else {
      if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });
      user.googleId = googleId;
      user.lastLoginAt = new Date();
      if (!user.avatar && picture) user.avatar = picture;
      await user.save();
    }

    await populateNotifications(user);
    const jwtToken = createToken(user._id.toString());
    setcookie(res, jwtToken);
    return res.redirect(process.env.USER_FRONTEND_URL!);
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};

export const githubLogin = async (_req: Request, res: Response) => {
  const platform = _req.query.platform === "mobile" ? "mobile" : "web";
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_CALLBACK_URL!,
    scope: "read:user user:email",
    state: platform,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ message: "GitHub code is required" });
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token",
      {
        method: "POST", headers: { Accept: "application/json" },
        body: new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID!, client_secret: process.env.GITHUB_CLIENT_SECRET!, code: code as string }),
      }
    );
    const { access_token } = await tokenResponse.json();

    if (!access_token) return res.status(401).json({ message: "GitHub authentication failed" });
    const githubResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}`, Accept: "application/vnd.github+json", "User-Agent": "Nazarify" },
    });
    const githubUser = await githubResponse.json();
    const emailsResponse = await fetch("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${access_token}`, Accept: "application/vnd.github+json", "User-Agent": "Nazarify" } });
    const emails = await emailsResponse.json();
    const email = emails.find((e: any) => e.primary && e.verified)?.email || emails.find((e: any) => e.verified)?.email;
    if (!email) return res.status(400).json({ message: "No verified GitHub email found" });
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email: email.toLowerCase(),
        username: githubUser.login,
        githubId: githubUser.id,
        avatar: githubUser.avatar_url,
        isEmailVerified: true,
        lastLoginAt: new Date(),
      });

      await NotificationService.notifyWelcome(user._id.toString(), user.name);
    } else {
      if (!user.isActive) return res.status(403).json({ message: "Account is disabled" });

      if (!user.avatar && githubUser.avatar_url) user.avatar = githubUser.avatar_url;
      user.isEmailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    await populateNotifications(user);
    const token = createToken(user._id.toString());
    setcookie(res, token);
    if (state === "mobile") {
      const userData = JSON.stringify({_id: user._id, name: user.name, email: user.email, avatar: user.avatar, phone: user.phone });
      return res.redirect(`nazarify://auth/github?token=${encodeURIComponent(token)}&user=${encodeURIComponent(userData)}`);
    }
    return res.redirect(process.env.USER_FRONTEND_URL!);
  } catch (error) {
    console.error("GitHub login error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { fcmToken } = req.body;
    if (fcmToken && req.user?.sub) {
      await User.findByIdAndUpdate(req.user.sub, { $pull: { fcmTokens: fcmToken } });
    }
  } catch (error) {
    console.error("Error removing FCM token on logout:", error);
  }
  clearcookie(res);
  return res.status(200).json({ message: "Logout successful" });
};
