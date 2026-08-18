// src/controllers/notification.ts
import { Request, Response } from "express";
import Notification from "../models/notification";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, unread, archived = "false" } = req.query;
    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const filter: Record<string, any> = {
      recipient: req.user!.sub,
      recipientType: req.user!.role,
      isArchived: archived === "true",
    };

    if (unread !== undefined) {
      filter.isRead = unread !== "false";
    }

    const skip = (currentPage - 1) * perPage;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      Notification.countDocuments(filter),
      Notification.countDocuments({
        recipient: req.user!.sub,
        recipientType: req.user!.role,
        isRead: false,
        isArchived: false,
      }),
    ]);

    const pages = Math.ceil(total / perPage);

    return res.status(200).json({
      notifications,
      unreadCount,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        pages,
        hasNextPage: currentPage < pages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user!.sub,
      recipientType: req.user!.role,
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.status(200).json({ notification });
  } catch (error) {
    console.error("Get notification error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!.sub, recipientType: req.user!.role, },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.updateMany(
      { recipient: req.user!.sub, recipientType: req.user!.role, isRead: false, isArchived: false, },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({ message: " server error" });
  }
};

export const archiveNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!.sub, recipientType: req.user!.role, },
      { $set: { isArchived: true, archivedAt: new Date(), } },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.status(200).json({ message: "Notification archived successfully", notification });
  } catch (error) {
    console.error("Archive notification error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const deleteNotification = async (req: Request,res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user!.sub,
      recipientType: req.user!.role,
    });

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { recipient, recipientType, title, message } = req.body;

    if (!recipient || !recipientType || !title || !message) {
      return res.status(400).json({ message: "Recipient, recipientType, title and message are required", });
    }

    const notification = await Notification.create(req.body);

    return res.status(201).json({ message: "Notification created successfully", notification, });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({ message: "server error" });
  }
};
