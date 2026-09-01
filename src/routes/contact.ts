import { Router } from "express";
import { getContact, updateContact } from "../controllers/contact";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getContact);
router.patch("/", protectAdmin, updateContact);

export default router;
