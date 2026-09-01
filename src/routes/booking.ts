import { Router } from "express";
import { createBooking, getUserBookings, getAdminBookings, cancelBooking, updateBooking, deleteBooking } from "../controllers/bookings";
import { protectUser } from "../middleware/auth";
import { protectAdmin } from "../middleware/admin";
import { protectAny } from "../middleware/any";

const router = Router();

router.post("/", protectUser, createBooking);
router.get("/", protectUser, getUserBookings);
router.get("/admin", protectAdmin, getAdminBookings);

router.patch("/:id/cancel", protectAny, cancelBooking);
router.patch("/:id/update", protectAny, updateBooking);
router.delete("/:id", protectAny, deleteBooking);
export default router;
