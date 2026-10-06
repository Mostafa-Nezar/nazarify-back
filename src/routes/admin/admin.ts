import { Router } from "express";
import { deleteAdmin, deleteUser, getAdmins, getMasters, getMe, getUsers, updateAdmin } from "../../controllers/admin/admin";
import { protectAdmin } from "../../middleware/admin";

const router = Router();

router.get("/me", protectAdmin, getMe);
router.get("/admins", protectAdmin, getAdmins);
router.patch("/admins/:id", protectAdmin, updateAdmin);
router.delete("/admins/:id", protectAdmin, deleteAdmin);
router.get("/masters", protectAdmin, getMasters);
router.get("/users", protectAdmin, getUsers);
router.delete("/users/:id", protectAdmin, deleteUser);

export default router;
