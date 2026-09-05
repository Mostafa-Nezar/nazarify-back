import mongoose, { Document, Schema } from "mongoose";

export interface IPrivacyPolicy extends Document {
  title: string;
  content: string;
  sections: { title: string; content: string; sortOrder: number }[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const privacyPolicySchema = new Schema<IPrivacyPolicy>(
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
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IPrivacyPolicy>("privacyPolicy", privacyPolicySchema);
