import { Router } from "express";
import { register, googlelogin, githubLogin, githubCallback, login, logout } from "../../controllers/admin/auth";

const router = Router();

router.post("/register", register);
router.post("/google", googlelogin);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);
router.post("/login", login);
router.post("/logout", logout);

export default router;
