import { Router } from "express";
import { createPage, deletePage, getPages, updatePage } from "../controllers/pages";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getPages);
router.post("/", protectAdmin, createPage);
router.patch("/:id", protectAdmin, updatePage);
router.delete("/:id", protectAdmin, deletePage);

export default router;
