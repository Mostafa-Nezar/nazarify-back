import mongoose, { Document, Schema } from "mongoose";

export interface IPartner extends Document {
  name: string;
  image?: string;
  link: string;
  job?: string;
  jobTitle?: string;
  activityWithNazarify?: string;
  rating?: number;
  comment?: string;
  description?: string;
  recommendation?: string;
  website?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const partnerSchema = new Schema<IPartner>(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    job: { type: String, trim: true },
    link: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    activityWithNazarify: { type: String, trim: true },
    recommendation: { type: String, trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    comment: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IPartner>("partner", partnerSchema);
