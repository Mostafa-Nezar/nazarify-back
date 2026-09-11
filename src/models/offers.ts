import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOffer extends Document {
  service: Types.ObjectId;
  title: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discount: number;
  maxDiscount?: number;
  minPrice?: number;
  code?: string;
  startAt: Date;
  endAt: Date;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    service: {type: Schema.Types.ObjectId, ref: "service", required: true, index: true},
    title: {type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    description: {type: String, trim: true, maxlength: 500},
    discountType: {type: String, enum: ["percentage", "fixed"], required: true },
    discount: {type: Number, required: true, min: 0},
    maxDiscount: {type: Number, min: 0},
    minPrice: {type: Number, min: 0},
    code: {type: String, trim: true, uppercase: true, sparse: true, index: true },
    startAt: { type: Date, required: true, index: true},
    endAt: { type: Date, required: true, index: true},
    usageLimit: {type: Number, min: 1},
    usageCount: {type: Number, default: 0, min: 0},
    isActive: {type: Boolean, default: true, index: true},
    isFeatured: {type: Boolean, default: false, index: true},
    sortOrder: {type: Number, default: 0, index: true},
    createdBy: {type: Schema.Types.ObjectId, ref: "admin", required: true, index: true},
  },
  { timestamps: true, versionKey: false }
);

offerSchema.index({service: 1, isActive: 1, startAt: 1, endAt: 1});
export default mongoose.model<IOffer>("offer", offerSchema);
