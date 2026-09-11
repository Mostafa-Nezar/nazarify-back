import { Request, Response } from "express";
import PrivacyPolicy from "../models/privacy-policy";

export const getPrivacyPolicy = async (_req: Request, res: Response) => {
  try {
    const policy = await PrivacyPolicy.findOne();
    if (!policy) return res.status(404).json({ message: "Privacy policy not found" });
    return res.status(200).json({ privacyPolicy: policy });
  } catch (error) {
    console.error("Get privacy policy error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const policy = await PrivacyPolicy.findOneAndUpdate(
      {},
      { $set: { ...req.body, lastUpdated: new Date() } },
      { returnDocument: "after", upsert: true, runValidators: true }
    );
    return res.status(200).json({ privacyPolicy: policy, message: "Privacy policy updated successfully" });
  } catch (error) {
    console.error("Update privacy policy error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addSection = async (req: Request, res: Response) => {
  try {
    const { title, content, sortOrder } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });

    const policy = await PrivacyPolicy.findOneAndUpdate(
      {},
      { $push: { sections: { title, content, sortOrder: sortOrder ?? 0 } }, $set: { lastUpdated: new Date() } },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return res.status(201).json({ privacyPolicy: policy, message: "Section added successfully" });
  } catch (error) {
    console.error("Add privacy policy section error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSection = async (req: Request, res: Response) => {
  try {
    const policy = await PrivacyPolicy.findOneAndUpdate(
      {},
      { $pull: { sections: { _id: req.params.id } }, $set: { lastUpdated: new Date() } },
      { returnDocument: "after" }
    );

    if (!policy) return res.status(404).json({ message: "Privacy policy not found" });

    return res.status(200).json({ privacyPolicy: policy, message: "Section deleted successfully" });
  } catch (error) {
    console.error("Delete privacy policy section error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
