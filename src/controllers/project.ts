import { Request, Response } from "express";
import Project from "../models/project";

export const getProjects = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 12, search, category, technology, featured } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 12, 1), 100);
        const filter: Record<string, any> = { isActive: true };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { shortDescription: { $regex: search, $options: "i" } },
                { technologies: { $regex: search, $options: "i" } },
            ];
        }

        if (category) filter.category = category;

        if (technology) filter.technologies = { $in: [technology] };
        if (featured !== undefined) filter.isFeatured = featured === "true";

        const skip = (currentPage - 1) * perPage;
        const [projects, total] = await Promise.all([
            Project.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(perPage),
            Project.countDocuments(filter),
        ]);

        return res.status(200).json({
            projects,
            pagination: {
                page: currentPage,
                limit: perPage,
                total,
                pages: Math.ceil(total / perPage),
                hasNextPage: currentPage < Math.ceil(total / perPage),
                hasPreviousPage: currentPage > 1,
            },
        });
    } catch (error) {
        console.error("Get projects error:", error);
        return res.status(500).json({message: "Server error"});
    }
};

export const getProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, isActive: true });
        if (!project) return res.status(404).json({message: "Project not found"});
        
        return res.status(200).json({ project });
    } catch (error) {
        console.error("Get project error:", error);
        return res.status(500).json({message: "Server error"});
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const { title, slug, description } = req.body;
        if (!title || !slug || !description) return res.status(400).json({ message: "Title, slug and description are required" });

        const normalizedSlug = slug.trim().toLowerCase();
        if (await Project.exists({ slug: normalizedSlug })) return res.status(409).json({ message: "Slug already exists" });

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const projectData: any = { ...req.body, slug: normalizedSlug, createdBy: req.user!.sub };
        if (files?.image?.[0]) projectData.image = files.image[0].path;
        if (files?.gallery) projectData.gallery = files.gallery.map((file) => file.path);

        const project = await Project.create(projectData);

        return res.status(201).json({ message: "Project created successfully", project });
    } catch (error) {
        console.error("Create project error:", error);
        return res.status(500).json({message: "Server error"});
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        if (req.body.slug) {
            req.body.slug = req.body.slug.trim().toLowerCase();
            const existingProject = await Project.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } });
            if (existingProject) return res.status(409).json({message: "Slug already exists"});
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const updateData: any = { ...req.body };

        if (files?.image?.[0]) updateData.image = files.image[0].path;

        let existingGallery: string[] = [];
        if (req.body.gallery) {
            if (Array.isArray(req.body.gallery)) existingGallery = req.body.gallery;
            else if (typeof req.body.gallery === 'string') {
                try {
                    existingGallery = JSON.parse(req.body.gallery);
                } catch (e) {
                    existingGallery = [req.body.gallery];
                }
            }
        }

        if (files?.gallery) {
            const newGalleryImages = files.gallery.map((file) => file.path);
            updateData.gallery = [...existingGallery, ...newGalleryImages];
        } else if (req.body.gallery) {
            updateData.gallery = existingGallery;
        }

        const project = await Project.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });
        if (!project) return res.status(404).json({message: "Project not found"});

        return res.status(200).json({message: "Project updated successfully", project});
    } catch (error) {
        console.error("Update project error:", error);
        return res.status(500).json({message: "server error"});
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) return res.status(404).json({message: "Project not found"});

        return res.status(200).json({message: "Project deleted successfully"});
    } catch (error) {
        console.error("Delete project error:", error);
        return res.status(500).json({message: "server error"});
    }
};

export const toggleProject = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) return res.status(404).json({message: "Project not found"});

        project.isActive = !project.isActive;
        await project.save();

        return res.status(200).json({message: "Project status updated successfully", project});
    } catch (error) {
        console.error("Toggle project error:", error);
        return res.status(500).json({message: "server error"});
    }
};

export const toggleFeatured = async (req: Request, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({message: "Project not found"});

        project.isFeatured = !project.isFeatured;
        await project.save();

        return res.status(200).json({message: "Project featured status updated successfully", project});
    } catch (error) {
        console.error("Toggle featured error:", error);
        return res.status(500).json({message: "server error"});
    }
};
