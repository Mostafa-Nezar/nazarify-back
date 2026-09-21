import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  focusKeyword?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  noArchive?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCreator?: string;
  author?: string;
  appLinks?: { ios?: { url?: string; appStoreId?: string; appName?: string; }; android?: { url?: string; package?: string; appName?: string; }; };
  canonicalTag?: string;
}

export const seoSchema = new Schema<ISEO>(
  {
    metaTitle: { type: String, trim: true, maxlength: 150 },
    metaDescription: { type: String, trim: true, maxlength: 350 },
    keywords: { type: [String], default: [] },
    focusKeyword: { type: String, trim: true, maxlength: 100 },
    canonicalUrl: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
    noArchive: { type: Boolean, default: false },
    ogTitle: { type: String, trim: true, maxlength: 150 },
    ogDescription: { type: String, trim: true, maxlength: 350 },
    ogImage: { type: String, trim: true },
    ogType: { type: String, trim: true, default: "website" },
    ogUrl: { type: String, trim: true },
    ogSiteName: { type: String, trim: true, default: "Nazarify" },
    twitterCard: { type: String, enum: ["summary", "summary_large_image", "app", "player"], default: "summary_large_image" },
    twitterTitle: { type: String, trim: true, maxlength: 150 },
    twitterDescription: { type: String, trim: true, maxlength: 350 },
    twitterImage: { type: String, trim: true },
    twitterCreator: { type: String, trim: true },
    author: { type: String, trim: true },
    canonicalTag: { type: String, trim: true },
    appLinks: {
      _id: false,
      ios: { _id: false, url: { type: String, trim: true }, appStoreId: { type: String, trim: true }, appName: { type: String, trim: true } },
      android: { _id: false, url: { type: String, trim: true }, package: { type: String, trim: true }, appName: { type: String, trim: true } },
    }
  },
  { timestamps: true, _id: false }
);

export interface IHeroSection {
  title?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
}

const heroSectionSchema = new Schema<IHeroSection>(
  {
    title: { type: String, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 500 },
    image: { type: String, trim: true },
    ctaText: { type: String, trim: true, maxlength: 50 },
    ctaLink: { type: String, trim: true },
  },
  { _id: false }
);

export interface IPage extends Document {
  title: string;
  slug: string;
  path?: string;
  hero?: IHeroSection;
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
    hero: { type: heroSectionSchema },
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
