import mongoose, { Document, Schema } from "mongoose";
import type { INotification } from "./notification";

export interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password?: string;
  avatar?: string;
  googleId?: string;
  githubId?: string;
  phone?: string;
  bio?: string;
  role: "user";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notifications?: INotification[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, unique: true, trim: true, minlength: 3, maxlength: 30 },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true, index: true },
    githubId: { type: String, unique: true, sparse: true, index: true },
    avatar: { type: String, trim: true },
    phone: { type: String, trim: true, maxlength: 30 },
    bio: { type: String, trim: true, maxlength: 500 },
    role: { type: String, enum: ["user"], default: "user", immutable: true },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true, versionKey: false }
);

userSchema.virtual("notifications", { ref: "notification", localField: "_id", foreignField: "recipient", justOne: false, match: { recipientType: "user" }, options: { sort: { createdAt: -1 } }});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

export default mongoose.model<IUser>("user", userSchema);
