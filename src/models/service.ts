import mongoose, { Document, Schema, Types } from "mongoose";

export interface IService extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  image?: string;
  price?: number;
  currency: string;
  features: string[];
  category?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    icon: { type: String, trim: true },
    image: { type: String, trim: true },
    price: { type: Number, min: 0 },
    currency: { type: String, default: "EGP", uppercase: true, trim: true, maxlength: 3 },
    features: { type: [String], default: [] },
    category: { type: String, trim: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "admin", required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

serviceSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model<IService>("service", serviceSchema);