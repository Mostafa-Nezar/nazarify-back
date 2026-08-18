// src/routes/notifications.ts
import { Router } from "express";
import { getNotifications, getNotification, markAsRead, markAllAsRead, archiveNotification, deleteNotification, createNotification, } from "../controllers/notification";
import { protectUser } from "../middleware/auth";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", protectUser, getNotifications);
router.get("/:id", protectUser, getNotification);
router.patch("/:id/read", protectUser, markAsRead);
router.patch("/read-all", protectUser, markAllAsRead);
router.patch("/:id/archive", protectUser, archiveNotification);
router.delete("/:id", protectUser, deleteNotification);

router.post("/", protectAdmin, createNotification);

export default router;
