import { Router } from "express";
import { githubSignin,githubLogin2,githubCallback2 } from "../../controllers/user/draft";

const router = Router();

router.post("/githubsignin", githubSignin);
router.get("/github2", githubLogin2);
router.get("/github2/callback", githubCallback2);
