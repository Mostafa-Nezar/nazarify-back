import { Router } from "express";
import { getSkills, getSkill, createSkill, updateSkill, deleteSkill, toggleSkill, toggleFeatured } from "../controllers/skill";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getSkills);
router.get("/:id", getSkill);

router.post("/", protectAdmin, createSkill);
router.patch("/:id", protectAdmin, updateSkill);
router.delete("/:id", protectAdmin, deleteSkill);
router.patch("/:id/toggle", protectAdmin, toggleSkill);
router.patch("/:id/featured", protectAdmin, toggleFeatured);

export default router;
