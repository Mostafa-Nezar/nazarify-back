import { Request, Response } from "express";
import Contact from "../models/contact";

export const getContact = async (_req: Request, res: Response) => {
  try {
    const contact = await Contact.findOne();
    if (!contact) return res.status(404).json({ message: "Contact information not found" });
    return res.status(200).json({ contact });
  } catch (error) {
    console.error("Get contact error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Contact information updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

