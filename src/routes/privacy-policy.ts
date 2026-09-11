import { Router } from "express";
import {
    getPrivacyPolicy,
    updatePrivacyPolicy,
    addSection,
    deleteSection,
} from "../controllers/privacy-policy";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getPrivacyPolicy);
router.post("/", protectAdmin, updatePrivacyPolicy);
router.post("/section", protectAdmin, addSection);
router.delete("/section/:id", protectAdmin, deleteSection);

export default router;
