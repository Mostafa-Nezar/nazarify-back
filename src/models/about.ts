import mongoose, { Document, Schema } from "mongoose";

export interface IAbout extends Document {
  title: string;
  description: string;
  image?: string;
  faqs: { question: string; answer: string }[];
  whyNazarify: { title: string; description: string; sortOrder: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const aboutSchema = new Schema<IAbout>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    faqs: {
      type: [
        {
          question: { type: String, required: true, trim: true },
          answer: { type: String, required: true, trim: true },
          isActive: { type: Boolean, default: true },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    whyNazarify: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          description: { type: String, required: true, trim: true },
          isActive: { type: Boolean, default: true },
          sortOrder: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IAbout>("about", aboutSchema);
