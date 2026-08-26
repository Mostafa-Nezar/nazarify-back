import { Router } from "express";
import { register, login, googleLogin, githubLogin, githubCallback, githubLogin2, githubCallback2, logout } from "../../controllers/user/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.get("/github2", githubLogin2);
router.get("/github2/callback", githubCallback2);
router.post("/logout", logout);

export default router;