import { ISEO } from "../models/seo";

interface SeoDefaults {
  title: string;
  description?: string;
  path?: string;
  useFaviconImage?: boolean;
}

const siteUrl = (process.env.USER_FRONTEND_URL || "https://nazarify.vercel.app").replace(/\/$/, "");

export const withDefaultSeo = (seo: ISEO | undefined, defaults: SeoDefaults): ISEO => {
  const title = defaults.title.trim();
  const description = defaults.description?.trim() || title;
  const canonicalUrl = defaults.path ? `${siteUrl}${defaults.path}` : undefined;
  const faviconUrl = `${siteUrl}/favicon.ico`;

  return {
    metaTitle: title,
    metaDescription: description,
    keywords: [title, "Nazarify"],
    canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogType: "website",
    ogUrl: canonicalUrl,
    ogSiteName: "Nazarify",
    twitterCard: "summary_large_image",
    twitterTitle: title,
    twitterDescription: description,
    ...(defaults.useFaviconImage ? { ogImage: faviconUrl, twitterImage: faviconUrl } : {}),
    ...seo,
  };
};
