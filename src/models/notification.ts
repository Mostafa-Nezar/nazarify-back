import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  recipientType: "user" | "admin";
  type: "system" | "service" | "project" | "tool" | "account" | "security" | "request" | "message" | "success" | "warning" | "error";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  link?: string;
  icon?: string;
  image?: string;
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, required: true, index: true },
    recipientType: { type: String, enum: ["user", "admin"], required: true, index: true },
    type: { type: String, enum: ["system", "service", "project", "tool", "account", "security", "request", "message", "success", "warning", "error",], default: "system", index: true, },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 150 },
    message: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    data: { type: Schema.Types.Mixed, default: undefined },
    link: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, trim: true, maxlength: 100 },
    image: { type: String, trim: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    isArchived: { type: Boolean, default: false, index: true },
    archivedAt: Date,
    expiresAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ recipient: 1, recipientType: 1, isRead: 1, createdAt: -1, }); 
notificationSchema.index({ recipient: 1, recipientType: 1, isArchived: 1, createdAt: -1, });
notificationSchema.index({ expiresAt: 1, });

export default mongoose.model<INotification>("notification", notificationSchema);
