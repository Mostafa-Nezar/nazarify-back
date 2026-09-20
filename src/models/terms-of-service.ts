import mongoose, { Document, Schema } from "mongoose";
import { ISEO, seoSchema } from "./seo";

export interface ITermsOfService extends Document {
  title: string;
  content: string;
  sections: { title: string; content: string; sortOrder: number }[];
  lastUpdated: Date;
  seo?: ISEO;
  createdAt: Date;
  updatedAt: Date;
}

const termsOfServiceSchema = new Schema<ITermsOfService>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    sections: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          content: { type: String, required: true, trim: true },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    lastUpdated: { type: Date, default: Date.now },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<ITermsOfService>("termsOfService", termsOfServiceSchema);
