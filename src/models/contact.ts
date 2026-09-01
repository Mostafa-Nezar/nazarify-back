import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  email: string;
  phone: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  telegram?: string;
  whatsapp?: string;
  tiktok?: string;
  linkedin?: string;
  managerEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    github: { type: String, trim: true },
    telegram: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    tiktok: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    managerEmail: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IContact>("contact", contactSchema);
