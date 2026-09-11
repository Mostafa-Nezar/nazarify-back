import { Router } from "express";
import {
    getTermsOfService,
    updateTermsOfService,
    addSection,
    deleteSection,
} from "../controllers/terms-of-service";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getTermsOfService);
router.post("/", protectAdmin, updateTermsOfService);
router.post("/section", protectAdmin, addSection);
router.delete("/section/:id", protectAdmin, deleteSection);

export default router;
