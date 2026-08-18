import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISkill extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  icon?: string;
  image?: string;
  website?: string;
  category: "frontend" | "backend" | "mobile" | "database" | "devops" | "testing" | "design" | "language" | "framework" | "library" | "tool" | "other";
  type: "skill" | "software" | "service" | "platform" | "other";
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  tags: string[];
  relatedTools: Types.ObjectId[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 5000 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    icon: { type: String, trim: true },
    image: { type: String, trim: true },
    website: { type: String, trim: true },
    category: { type: String, enum: ["frontend", "backend", "mobile", "database", "devops", "testing", "design", "language", "framework", "library", "skill", "other"], default: "other", index: true, },
    type: { type: String, enum: ["skill", "software", "service", "platform", "other"], default: "skill", index: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced", "expert"], index: true },
    tags: { type: [String], default: [], index: true },
    relatedTools: [{ type: Schema.Types.ObjectId, ref: "tool" }],
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "admin", index: true, },
  },
  { timestamps: true, versionKey: false }
);

skillSchema.index({ isActive: 1, sortOrder: 1 });
skillSchema.index({ category: 1, isActive: 1 });
skillSchema.index({ type: 1, isActive: 1 });
skillSchema.index({ tags: 1, isActive: 1 });

export default mongoose.model<ISkill>("skill", skillSchema);
