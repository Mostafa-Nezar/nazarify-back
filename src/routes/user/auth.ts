import { Router } from "express";
import { register, login, githubLogin, githubCallback, googleSignIn, googleAuthLogin, googleCallback, logout } from "../../controllers/user/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleSignIn);
router.get("/google-auth", googleAuthLogin);
router.get("/google/callback", googleCallback);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

router.post("/logout", logout);

export default router;
