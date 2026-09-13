import { Router } from "express";
import { getNotifications, getNotification, markAsRead, markAllAsRead, archiveNotification, deleteNotification, createNotification, getAllNotificationsToAdmin, deleteNotificationByAdmin } from "../controllers/notification";
import { protectUser } from "../middleware/auth";
import { protectAdmin } from "../middleware/admin";

const router = Router();

router.get("/", protectUser, getNotifications);
router.get("/get-all", protectAdmin, getAllNotificationsToAdmin);
router.get("/:id", protectUser, getNotification);
router.patch("/:id/read", protectUser, markAsRead);
router.patch("/read-all", protectUser, markAllAsRead);
router.patch("/:id/archive", protectUser, archiveNotification);
router.delete("/:id", protectUser, deleteNotification);

router.post("/create", protectAdmin, createNotification);
router.delete("/:id/delete", protectAdmin, deleteNotificationByAdmin);

export default router;
