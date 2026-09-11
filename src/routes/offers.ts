import { Router } from "express";
import { createOffer, getOffers, getOffer, updateOffer, deleteOffer, getServiceOffers, validateOffer } from "../controllers/offers";
import { protectUser } from "../middleware/auth";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", getOffers);
router.get("/service/:serviceId", getServiceOffers);
router.get("/:id", getOffer);
router.post("/", protectAdmin, createOffer);
router.post("/validate", protectUser, validateOffer);
router.patch("/:id", protectAdmin, updateOffer);
router.delete("/:id", protectAdmin, deleteOffer);

export default router;
