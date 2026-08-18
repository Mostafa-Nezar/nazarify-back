import { Request, Response } from "express";
import Tool from "../models/tool";

export const getTools = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category, technology, featured,
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 12, 1), 100);

    const filter: Record<string, any> = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { technologies: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;

    if (technology) {
      filter.technologies = { $in: [technology] };
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    const skip = (currentPage - 1) * perPage;

    const [tools, total] = await Promise.all([
      Tool.find(filter)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(perPage),
      Tool.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / perPage);

    return res.status(200).json({
      tools,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        pages,
        hasNextPage: currentPage < pages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get tools error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTool = async (req: Request, res: Response) => {
  try {
    const tool = await Tool.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    return res.status(200).json({ tool });
  } catch (error) {
    console.error("Get tool error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createTool = async (req: Request, res: Response) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug || !description) {
      return res.status(400).json({
        message: "Name, slug and description are required",
      });
    }

    const normalizedSlug = slug.trim().toLowerCase();

    if (await Tool.exists({ slug: normalizedSlug })) {
      return res.status(409).json({
        message: "Slug already exists",
      });
    }

    const tool = await Tool.create({
      ...req.body,
      slug: normalizedSlug,
      createdBy: req.user!.sub,
    });

    return res.status(201).json({
      message: "Tool created successfully",
      tool,
    });
  } catch (error) {
    console.error("Create tool error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTool = async (req: Request, res: Response) => {
  try {
    if (req.body.slug) {
      req.body.slug = req.body.slug.trim().toLowerCase();

      if (
        await Tool.exists({
          slug: req.body.slug,
          _id: { $ne: req.params.id },
        })
      ) {
        return res.status(409).json({
          message: "Slug already exists",
        });
      }
    }

    const tool = await Tool.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    return res.status(200).json({
      message: "Tool updated successfully",
      tool,
    });
  } catch (error) {
    console.error("Update tool error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTool = async (req: Request, res: Response) => {
  try {
    const tool = await Tool.findByIdAndDelete(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    return res.status(200).json({
      message: "Tool deleted successfully",
    });
  } catch (error) {
    console.error("Delete tool error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleTool = async (req: Request, res: Response) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    tool.isActive = !tool.isActive;
    await tool.save();

    return res.status(200).json({
      message: "Tool status updated successfully",
      tool,
    });
  } catch (error) {
    console.error("Toggle tool error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleFeatured = async (req: Request, res: Response) => {
  try {
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      return res.status(404).json({ message: "Tool not found" });
    }

    tool.isFeatured = !tool.isFeatured;
    await tool.save();

    return res.status(200).json({
      message: "Tool featured status updated successfully",
      tool,
    });
  } catch (error) {
    console.error("Toggle tool featured error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
