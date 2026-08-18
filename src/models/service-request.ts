import mongoose, { Document, Schema, Types } from "mongoose";

export interface IServiceRequest extends Document {
  user: Types.ObjectId;
  service: Types.ObjectId;
  title: string;
  message: string;
  budget?: { min?: number; max?: number; currency: string };
  deadline?: Date;
  attachments: string[];
  contact: { name: string; email: string; phone?: string };
  status: "pending" | "reviewing" | "accepted" | "rejected" | "in_progress" | "completed" | "cancelled";
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true, index: true },
    service: { type: Schema.Types.ObjectId, ref: "service", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 10000, },
    budget: {
      min: { type: Number, min: 0, },
      max: { type: Number, min: 0, },
      currency: { type: String, default: "EGP", uppercase: true, trim: true, minlength: 3, maxlength: 3 },
    },
    deadline: { type: Date },
    attachments: { type: [String], default: [] },
    contact: {
      name: { type: String, required: true, trim: true, maxlength: 100, },
      email: { type: String, required: true, lowercase: true, trim: true, maxlength: 255, },
      phone: { type: String, trim: true, maxlength: 30 },
    },

    status: { type: String, enum: ["pending", "reviewing", "accepted", "rejected", "in_progress", "completed", "cancelled"], default: "pending", index: true },
    adminNotes: { type: String, trim: true, maxlength: 5000 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "admin", index: true },
    reviewedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

serviceRequestSchema.index({ user: 1, createdAt: -1 });
serviceRequestSchema.index({ service: 1, status: 1, createdAt: -1 });
serviceRequestSchema.index({ status: 1, createdAt: -1 });

serviceRequestSchema.pre("validate", function (next) {
  if (
    this.budget?.min !== undefined &&
    this.budget?.max !== undefined &&
    this.budget.min > this.budget.max
  ) {
    return next(new Error("Minimum budget cannot exceed maximum budget"));
  }

  next();
});

export default mongoose.model<IServiceRequest>("service-request", serviceRequestSchema);
