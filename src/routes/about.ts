import { Router } from "express";
const router = Router();
import { getAbout, updateAbout, addFaq, deleteFaq, addWhyNazarify, deleteWhyNazarify } from "../controllers/about";
import { protectAdmin } from "../middleware/admin";

router.get("/", getAbout);
router.post("/", protectAdmin, updateAbout);
router.post("/faq", protectAdmin, addFaq);
router.delete("/faq/:id", protectAdmin, deleteFaq);
router.post("/why-nazarify", protectAdmin, addWhyNazarify);
router.delete("/why-nazarify/:id", protectAdmin, deleteWhyNazarify);

export default router;
