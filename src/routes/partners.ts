import { Router } from "express";
import { submitPartner,getPartners,deletePartner } from "../controllers/partners";
import { protectAdmin } from "../middleware/admin";
import multer from "multer";
import { storage } from "../config/cloudinary";

const upload = multer({ storage });

const router = Router();

router.post("/", upload.single("image"), submitPartner);
router.get("/", getPartners);
router.delete("/:id", protectAdmin, deletePartner);

export default router;
