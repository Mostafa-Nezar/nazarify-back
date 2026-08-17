import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  image?: string;
  gallery: string[];
  technologies: string[];
  category?: string;
  clientName?: string;
  projectUrl?: string;
  githubUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    image: { type: String, trim: true },
    gallery: { type: [String], default: [] },
    technologies: { type: [String], default: [], index: true },
    category: { type: String, trim: true, index: true },
    clientName: { type: String, trim: true, maxlength: 150 },
    projectUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "admin", required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

projectSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model<IProject>("project", projectSchema);
