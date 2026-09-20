import mongoose, { Document, Schema, Types } from "mongoose";
import { ISEO, seoSchema } from "./seo";

export interface IPage extends Document {
  title: string;
  slug: string;
  path?: string;
  content: string;
  excerpt?: string;
  showInHeader: boolean;
  showInFooter: boolean;
  isActive: boolean;
  sortOrder: number;
  seo?: ISEO;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // System pages can point to an existing public route (e.g. /about). Custom
    // pages keep using /pages/:slug when this is omitted.
    path: { type: String, trim: true, match: /^\// },
    content: { type: String, required: true, trim: true, maxlength: 20000 },
    excerpt: { type: String, trim: true, maxlength: 300 },
    showInHeader: { type: Boolean, default: false, index: true },
    showInFooter: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    seo: { type: seoSchema, default: () => ({}) },
    createdBy: { type: Schema.Types.ObjectId, ref: "admin", required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

pageSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model<IPage>("page", pageSchema);
