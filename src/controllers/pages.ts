import { Request, Response } from "express";
import Page from "../models/pages";

export const getPages = async (_req: Request, res: Response) => {
  try {
    const pages = await Page.find().sort({ sortOrder: 1, createdAt: -1 });
    return res.status(200).json({ pages });
  } catch (error) {
    console.error("Get pages error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createPage = async (req: Request, res: Response) => {
  try {
    const { title, slug, content } = req.body;
    if (!title || !slug || !content) return res.status(400).json({ message: "Title, slug and content are required" });

    const normalizedSlug = slug.trim().toLowerCase();
    if (await Page.exists({ slug: normalizedSlug })) return res.status(409).json({ message: "Slug already exists" });

    const page = await Page.create({
      ...req.body,
      slug: normalizedSlug,
      ...(typeof req.body.path === "string" && req.body.path.trim() ? { path: req.body.path.trim() } : {}),
      seo: {
        title,
        description: req.body.excerpt || content.slice(0, 300),
        keywords: req.body.keywords,
        ogTitle: req.body.ogTitle,
        ogDescription: req.body.ogDescription,
        ogImage: req.body.ogImage,
        robots: req.body.robots,
      },
      createdBy: req.user!.sub,
    });
    return res.status(201).json({ message: "Page created successfully", page });
  } catch (error) {
    console.error("Create page error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updatePage = async (req: Request, res: Response) => {
  try {
    const updateData = { ...req.body } as Record<string, unknown>;
    if (typeof updateData.slug === "string") {
      updateData.slug = updateData.slug.trim().toLowerCase();
      if (await Page.exists({ slug: updateData.slug, _id: { $ne: req.params.id } })) return res.status(409).json({ message: "Slug already exists" });
    }
    if (typeof updateData.path === "string") updateData.path = updateData.path.trim() || undefined;

    const page = await Page.findByIdAndUpdate(req.params.id, { $set: updateData }, { returnDocument: "after", runValidators: true });
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.status(200).json({ message: "Page updated successfully", page });
  } catch (error) {
    console.error("Update page error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePage = async (req: Request, res: Response) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Delete page error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
