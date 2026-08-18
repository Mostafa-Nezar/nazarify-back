import { Router } from "express";
import {
  getTools, getTool, createTool, updateTool, deleteTool, toggleTool, toggleFeatured,
} from "../controllers/tool";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getTools);
router.get("/:id", getTool);

router.post("/", protectAdmin, createTool);
router.patch("/:id", protectAdmin, updateTool);
router.delete("/:id", protectAdmin, deleteTool);
router.patch("/:id/toggle", protectAdmin, toggleTool);
router.patch("/:id/featured", protectAdmin, toggleFeatured);

export default router;
