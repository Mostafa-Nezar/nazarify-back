import { Schema } from "mongoose";

export interface IAlternateLanguage { lang: string; url: string; }

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
  }, { timestamps: true, _id: false },
);

export default seoSchema;
