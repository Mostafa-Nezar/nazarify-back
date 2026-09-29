import Notification from "../models/notification";
import User from "../models/user";
import { Types } from "mongoose";
import "../config/firebase";
import { getMessaging } from "firebase-admin/messaging";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HttpServer } from "http";

export type PushDelivery = {
  status: "sent" | "no_registered_tokens" | "failed";
  registeredTokenCount: number;
  successCount: number;
  failureCount: number;
};

class NotificationService {
  static io: SocketIOServer | null = null;
  static init(server: HttpServer) {
    this.io = new SocketIOServer(server, { cors: { origin: true, credentials: true, }, });
    this.io.on("connection", (socket: Socket) => {
      socket.on("join", (userId: string) => { if (userId) socket.join(`user_${userId}`); });
      socket.on("leave", (userId: string) => { if (userId) socket.leave(`user_${userId}`); });
    });
    return this.io;
  }

  static initSocket(server: HttpServer) { return this.init(server); }
  static setSocketIO(socketIO: SocketIOServer) { this.io = socketIO; }
  static getIO(): SocketIOServer | null { return this.io; }

  static async sendPushNotification(recipientId: string | Types.ObjectId, title: string, message: string, type: string, icon?: string): Promise<PushDelivery> {
    const user = await User.findById(recipientId).select("+fcmTokens");
    const tokens = [...new Set(user?.fcmTokens?.filter(Boolean) ?? [])];
    if (tokens.length === 0) {
      console.warn("Push notification skipped: recipient has no registered FCM tokens", { recipientId: recipientId.toString() });
      return { status: "no_registered_tokens", registeredTokenCount: 0, successCount: 0, failureCount: 0 };
    }

    try {
      let successCount = 0;
      let failureCount = 0;
      const failedTokens: string[] = [];

      // Firebase accepts at most 500 registration tokens per multicast call.
      for (let index = 0; index < tokens.length; index += 500) {
        const batch = tokens.slice(index, index + 500);
        const response = await getMessaging().sendEachForMulticast({
          tokens: batch,
          notification: { title, body: message },
          android: { priority: "high" },
          data: { type, ...(icon && { icon }) },
        });

        successCount += response.successCount;
        failureCount += response.failureCount;
        response.responses.forEach((resp, responseIndex) => {
          const errorCode = resp.error?.code;
          if (
            !resp.success &&
            (errorCode === "messaging/invalid-registration-token" || errorCode === "messaging/registration-token-not-registered")
          ) {
            failedTokens.push(batch[responseIndex]);
          }
        });
      }

      if (failedTokens.length > 0) {
        await User.findByIdAndUpdate(recipientId, { $pull: { fcmTokens: { $in: failedTokens } } });
      }

      if (failureCount > 0) {
        console.warn("Some FCM deliveries failed", { recipientId: recipientId.toString(), successCount, failureCount });
      }

      return { status: successCount > 0 ? "sent" : "failed", registeredTokenCount: tokens.length, successCount, failureCount };
    } catch (error) {
      console.error("Error sending push notification:", error);
      return { status: "failed", registeredTokenCount: tokens.length, successCount: 0, failureCount: tokens.length };
    }
  }

  static async createNotification(recipientId: string | Types.ObjectId, title: string, message: string, type: string = "system", recipientType: "user" | "admin" = "user", icon?: string) {
    try {
      const notification = new Notification({ recipient: recipientId, recipientType, type, title, message, ...(icon && { icon }) });
      await notification.save();
      const push = recipientType === "user"
        ? await this.sendPushNotification(recipientId, title, message, type, icon)
        : undefined;

      if (this.io) {
        this.io.to(`user_${recipientId.toString()}`).emit("newNotification", {
          _id: notification._id, title: notification.title, message: notification.message, type: notification.type,
          icon: notification.icon, isRead: notification.isRead, createdAt: notification.createdAt,
        });
      }

      return { notification, push };
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  static async notifyAllUsers(title: string, message: string, type: string = "system", icon?: string) {
    try {
      const users = await User.find({ isActive: true });
      const results = await Promise.allSettled(
        users.map((user) => this.createNotification(user._id as Types.ObjectId, title, message, type, "user", icon))
      );

      if (this.io) {
        this.io.emit("broadcastNotification", { title, message, type, icon, createdAt: new Date(), });
      }

      return results;
    } catch (error) {
      console.error("Error notifying all users:", error);
      throw error;
    }
  }

  static async notifyWelcome(userId: string | Types.ObjectId, userName: string) {
    const title = "Welcome to Nazarify";
    const message = `Welcome to Nazarify, ${userName}! Thank you for joining us.`;
    return await this.createNotification(userId, title, message, "system", "user", "waving_hand");
  }

  static async notifyProfileUpdated(userId: string | Types.ObjectId, userName: string) {
    const title = "Profile Updated";
    const message = `Profile updated successfully ${userName}!`;
    return await this.createNotification(userId, title, message, "system", "user", "waving_hand");
  }

  static async notifyBooking(userId: string | Types.ObjectId, serviceName: string) {
    const title = "Booking Request Received";
    const message = `We have successfully received your booking request for ${serviceName}. Our team will review it and get back to you shortly.`;
    return await this.createNotification(userId, title, message, "request", "user", "design_services");
  }

  static async notifyProjectStatusUpdate(userId: string | Types.ObjectId, projectName: string, status: string) {
    const title = "Project Status Updated";
    const message = `The status of your project "${projectName}" has been updated to: ${status}.`;
    return await this.createNotification(userId, title, message, "project", "user", "update");
  }

  static async notifyBookingAccepted(userId: string | Types.ObjectId, serviceName: string) {
    const title = "Booking Request Accepted";
    const message = `We have successfully accepted your booking request for ${serviceName}. Our team will get back to you shortly.`;
    return await this.createNotification(userId, title, message, "request", "user", "design_services");
  }

  static async notifyPaymentReceived(userId: string | Types.ObjectId, projectName: string, amount: number | string) {
    const title = "Payment Received";
    const message = `We have successfully received your payment of $${amount} for the project "${projectName}". Thank you!`;
    return await this.createNotification(userId, title, message, "success", "user", "payments");
  }

  static async notifyNewAnnouncement(title: string, message: string) {
    const users = await User.find({ isActive: true });
    return await Promise.allSettled(
      users.map((user) => this.createNotification(user._id as Types.ObjectId, title, message, "system", "user", "campaign"))
    );
  }

  static async notifyNewOffer(serviceName: string, offerTitle?: string, discount?: string | number) {
    const title = offerTitle ? `Special Offer: ${offerTitle}` : `New Offer on ${serviceName}!`;
    const message = discount
      ? `A new offer with ${discount}% discount is now available for ${serviceName}. Don't miss out!`
      : `A new special offer is now available for ${serviceName}. Check it out now!`;
    const users = await User.find({ isActive: true });
    return await Promise.allSettled(
      users.map((user) => this.createNotification(user._id as Types.ObjectId, title, message, "service", "user", "local_offer"))
    );
  }
}

export const getIO = () => NotificationService.getIO();
export default NotificationService;
