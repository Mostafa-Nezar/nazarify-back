import { Router } from "express";
import { submitPartner,getPartners,deletePartner } from "../controllers/partners";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.post("/", submitPartner);
router.get("/", getPartners);
router.delete("/:id", protectAdmin, deletePartner);

export default router;
