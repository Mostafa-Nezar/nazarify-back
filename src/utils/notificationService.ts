import Notification from "../models/notification";
import User from "../models/user";
import { Types } from "mongoose";

class NotificationService {
  static io: any = null;

  static setSocketIO(socketIO: any) {
    this.io = socketIO;
  }

  static async createNotification(
    recipientId: string | Types.ObjectId,
    title: string,
    message: string,
    type: string = "system",
    recipientType: "user" | "admin" = "user"
  ) {
    try {
      const notification = new Notification({
        recipient: recipientId,
        recipientType,
        type,
        title,
        message,
      });
      await notification.save();

      if (this.io) {
        this.io.to(`user_${recipientId.toString()}`).emit("newNotification", {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async notifyWelcome(userId: string | Types.ObjectId, userName: string) {
    const title = "Welcome to Nazarify";
    const message = `Welcome to Nazarify, ${userName}! Thank you for joining us.`;
    return await this.createNotification(userId, title, message, "system");
  }

  static async notifyServiceRequest(userId: string | Types.ObjectId, serviceName: string) {
    const title = "Service Request Received";
    const message = `We have successfully received your request for ${serviceName}. Our team will review it and get back to you shortly.`;
    return await this.createNotification(userId, title, message, "request");
  }

  static async notifyProjectStatusUpdate(
    userId: string | Types.ObjectId,
    projectName: string,
    status: string
  ) {
    const title = "Project Status Updated";
    const message = `The status of your project "${projectName}" has been updated to: ${status}.`;
    return await this.createNotification(userId, title, message, "project");
  }

  static async notifyPaymentReceived(
    userId: string | Types.ObjectId,
    projectName: string,
    amount: number | string
  ) {
    const title = "Payment Received";
    const message = `We have successfully received your payment of $${amount} for the project "${projectName}". Thank you!`;
    return await this.createNotification(userId, title, message, "success");
  }

  static async notifyNewAnnouncement(title: string, message: string) {
    const users = await User.find({ isActive: true });
    return await Promise.allSettled(
      users.map((user) => this.createNotification(user._id as Types.ObjectId, title, message, "system"))
    );
  }
}

export default NotificationService;
