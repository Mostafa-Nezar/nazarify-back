import { Request, Response } from "express";
import Skill from "../models/skill";

export const getSkills = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, search, category, type, level, tag, featured } = req.query;

        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

        const filter: Record<string, any> = {
            isActive: true,
        };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { shortDescription: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
            ];
        }

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (level) filter.level = level;
        if (tag) filter.tags = tag;
        if (featured !== undefined) filter.isFeatured = featured === "true";

        const skip = (currentPage - 1) * perPage;
        const [skills, total] = await Promise.all([Skill.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(perPage), Skill.countDocuments(filter)]);
        const pages = Math.ceil(total / perPage);

        return res.status(200).json({
            skills,
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
        console.error("Get skills error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findOne({ _id: req.params.id, isActive: true });
        if (!skill) return res.status(404).json({ message: "Skill not found" });

        return res.status(200).json({ skill });
    } catch (error) {
        console.error("Get skill error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const createSkill = async (req: Request, res: Response) => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) return res.status(400).json({ message: "Name and slug are required" });

        const normalizedSlug = slug.trim().toLowerCase();

        if (await Skill.exists({ slug: normalizedSlug })) return res.status(409).json({ message: "Slug already exists" });

        const skill = await Skill.create({ ...req.body, name: name.trim(), slug: normalizedSlug, createdBy: req.user!.sub });

        return res.status(201).json({ skill, message: "Skill created successfully" });
    } catch (error) {
        console.error("Create skill error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const updateSkill = async (req: Request, res: Response) => {
    try {
        if (req.body.slug) {
            req.body.slug = req.body.slug.trim().toLowerCase();
            if (await Skill.exists({ slug: req.body.slug, _id: { $ne: req.params.id } })) return res.status(409).json({ message: "Slug already exists" });
        }
        const skill = await Skill.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });

        if (!skill) return res.status(404).json({ message: "Skill not found" });
        return res.status(200).json({ skill, message: "Skill updated successfully" });
    } catch (error) {
        console.error("Update skill error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) return res.status(404).json({ message: "Skill not found" });
        return res.status(200).json({ skill, message: "Skill deleted successfully" });
    } catch (error) {
        console.error("Delete tool error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const toggleSkill = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) return res.status(404).json({ message: "Skill not found" });
        skill.isActive = !skill.isActive;
        await skill.save();
        return res.status(200).json({ skill, message: "Skill status updated successfully" });
    } catch (error) {
        console.error("Toggle skill error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const toggleFeatured = async (req: Request, res: Response) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) return res.status(404).json({ message: "Skill not found" });
        skill.isFeatured = !skill.isFeatured;
        await skill.save();
        return res.status(200).json({ skill, message: "Skill featured status updated successfully" });
    } catch (error) {
        console.error("Toggle skill featured error:", error);
        return res.status(500).json({ skill, message: "server error" });
    }
};
