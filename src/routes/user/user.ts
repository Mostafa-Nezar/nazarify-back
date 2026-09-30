import { Router } from "express";
import multer from "multer";
import { getProfile, updateProfile, changePassword, deleteAccount } from "../../controllers/user/user";
import { protectUser } from "../../middleware/auth";
import { storage } from "../../config/cloudinary";

const router = Router();
const upload = multer({ storage });

router.use(protectUser);

router.get("/", getProfile);
router.patch("/", upload.single("avatar"), updateProfile);
router.patch("/password", changePassword);
router.delete("/", deleteAccount);

export default router;