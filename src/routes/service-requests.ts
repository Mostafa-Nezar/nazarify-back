import { Router } from "express";
import { createServiceRequest, getServiceRequests, getServiceRequest, cancelServiceRequest, updateServiceRequest, rateServiceRequest, deleteServiceRequest } from "../controllers/service-request";
import { protectUser } from "../middleware/auth";
import { protectAny } from "../middleware/any";

const router = Router();

router.post("/", protectUser, createServiceRequest);
router.get("/", protectAny, getServiceRequests);
router.get("/:id", protectAny, getServiceRequest);
router.patch("/:id/cancel", protectAny, cancelServiceRequest);
router.patch("/:id/update", protectAny, updateServiceRequest);
router.patch("/:id/rate", protectUser, rateServiceRequest);
router.delete("/:id", protectAny, deleteServiceRequest);
export default router;
