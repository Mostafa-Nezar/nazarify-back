import { Request, Response } from "express";
import Service from "../models/service";

export const getServices = async (_req: Request, res: Response) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 })
    return res.status(200).json({ services });
  } catch (error) {
    console.error("Get services error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const getService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, isActive: true })

    if (!service) return res.status(404).json({ message: "Service not found" })

    return res.status(200).json({ service });
  } catch (error) {
    console.error("Get service error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const { title, slug, description } = req.body;

    if (!title || !slug || !description) return res.status(400).json({ message: "Title, slug and description are required" });
    if (await Service.exists({ slug })) return res.status(409).json({ message: "Slug already exists" });

    const service = await Service.create({ ...req.body, createdBy: req.user!.sub });
    return res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.error("Create service error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!service) return res.status(404).json({ message: "Service not found" })

    return res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    console.error("Update service error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" })

    return res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const toggleService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" })

    service.isActive = !service.isActive;
    await service.save();

    return res.status(200).json({ message: "Service status updated successfully", service });
  } catch (error) {
    console.error("Toggle service error:", error);
    return res.status(500).json({ message: "server error" });
  }
};
