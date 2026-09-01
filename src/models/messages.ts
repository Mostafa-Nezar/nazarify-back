import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  user?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255 },
    subject: { type: String, required: true, trim: true, maxlength: 300 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    user: { type: Schema.Types.ObjectId, ref: "user", index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IMessage>("messages", messageSchema);
