import { Router } from "express";
import multer from "multer";
import { getServices, getService, createService, updateService, deleteService, toggleService } from "../controllers/services";
import { protectAdmin } from "../middleware/admin";
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const router = Router();

router.get("/", getServices);
router.get("/:id", getService);

router.post("/", protectAdmin, createService);
router.patch("/:id", protectAdmin, updateService);
router.delete("/:id", protectAdmin, deleteService);
router.patch("/:id/toggle", protectAdmin, toggleService);

export default router;