import { Request, Response } from "express";
import TermsOfService from "../models/termsOfService";

export const getTermsOfService = async (_req: Request, res: Response) => {
  try {
    const terms = await TermsOfService.findOne();
    if (!terms) return res.status(404).json({ message: "Terms of service not found" });
    return res.status(200).json({ termsOfService: terms });
  } catch (error) {
    console.error("Get terms of service error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTermsOfService = async (req: Request, res: Response) => {
  try {
    const terms = await TermsOfService.findOneAndUpdate(
      {},
      { $set: { ...req.body, lastUpdated: new Date() } },
      { returnDocument: "after", upsert: true, runValidators: true }
    );
    return res.status(200).json({ termsOfService: terms, message: "Terms of service updated successfully" });
  } catch (error) {
    console.error("Update terms of service error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addSection = async (req: Request, res: Response) => {
  try {
    const { title, content, sortOrder } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });

    const terms = await TermsOfService.findOneAndUpdate(
      {},
      { $push: { sections: { title, content, sortOrder: sortOrder ?? 0 } }, $set: { lastUpdated: new Date() } },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return res.status(201).json({ termsOfService: terms, message: "Section added successfully" });
  } catch (error) {
    console.error("Add terms of service section error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSection = async (req: Request, res: Response) => {
  try {
    const terms = await TermsOfService.findOneAndUpdate(
      {},
      { $pull: { sections: { _id: req.params.id } }, $set: { lastUpdated: new Date() } },
      { returnDocument: "after" }
    );

    if (!terms) return res.status(404).json({ message: "Terms of service not found" });

    return res.status(200).json({ termsOfService: terms, message: "Section deleted successfully" });
  } catch (error) {
    console.error("Delete terms of service section error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
