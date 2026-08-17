import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  username: string;
  password?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: "user";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    password: { type: String, select: false },
    phone: { type: String, trim: true, maxlength: 30 },
    avatar: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },
    role: { type: String, enum: ["user"], default: "user", immutable: true },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
  },
  { timestamps: true, versionKey: false }
);


export default mongoose.model<IUser>("user", userSchema);