import { Request, Response } from "express";
import Partner from "../models/partners";

export const submitPartner = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Partner name is required" });

    const imageUrl = (req.file as any)?.path ?? undefined;

    const partner = await Partner.create({
      ...req.body,
      ...(imageUrl && { image: imageUrl }),
    });

    return res.status(201).json({ partner, message: "Partner submitted successfully" });
  } catch (error) {
    console.error("Submit partner error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPartners = async (_req: Request, res: Response) => {
  try {
    const partners = await Partner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    return res.status(200).json({ partners });
  } catch (error) {
    console.error("Get partners error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    return res.status(200).json({message: "Partner deleted successfully" });
  } catch (error) {
    console.error("Delete partner error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    return res.status(200).json({message: "Partner updated successfully" });
  } catch (error) {
    console.error("Update partner error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePartnerStatus = async (req: Request, res: Response) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body);
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    return res.status(200).json({message: "Partner status updated successfully" });
  } catch (error) {
    console.error("Update partner status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};