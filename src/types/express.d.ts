import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: "user" | "admin";
        jti: string;
        iat: number;
        exp: number;
      };
    }
  }
}
