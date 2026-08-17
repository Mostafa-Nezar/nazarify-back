import { Router } from "express";
import { getProjects, getProject, createProject, updateProject, deleteProject, toggleProject, toggleFeatured } from "../controllers/project";
import { protectAdmin } from "../middleware/admin";
import multer from "multer";
const { storage } = require("../config/cloudinary");

const upload = multer({ storage });
const router = Router();

router.get("/", getProjects);
router.get("/:id", getProject);

router.post("/", protectAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), createProject);
router.patch("/:id", protectAdmin, upload.fields([{ name: "image", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), updateProject);
router.delete("/:id", protectAdmin, deleteProject);
router.patch("/:id/toggle", protectAdmin, toggleProject);
router.patch("/:id/featured", protectAdmin, toggleFeatured);

export default router;
