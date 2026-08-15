import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITool extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  icon?: string;
  image?: string;
  url?: string;
  category?: string;
  technologies: string[];
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const toolSchema = new Schema<ITool>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    icon: { type: String, trim: true },
    image: { type: String, trim: true },
    url: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    technologies: { type: [String], default: [] },
    features: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "admin", required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

toolSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model<ITool>("tool", toolSchema);