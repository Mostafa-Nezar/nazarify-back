import { Router } from "express";
import { deleteUser, getUsers } from "../../controllers/admin/admin";
import { protectAdmin } from "../../middleware/admin";

const router = Router();

router.get("/users", protectAdmin, getUsers);
router.delete("/users/:id", protectAdmin, deleteUser);

export default router;
