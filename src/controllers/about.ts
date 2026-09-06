
import { Request, Response } from "express";
import About from "../models/about";

export const getAbout = async (_req: Request, res: Response) => {
  try {
    const about = await About.findOneAndUpdate(
      {},
      {
        $setOnInsert: {
          title: "About Nazarify",
          description: "Tell your visitors about Nazarify.",
          faqs: [],
          whyNazarify: [],
        },
      },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ about });
  } catch (error) {
    console.error("Get about error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const about = await About.findOneAndUpdate({}, { $set: req.body }, { returnDocument: "after", upsert: true, runValidators: true });
    return res.status(200).json({ about, message: "About updated successfully" });
  } catch (error) {
    console.error("Update about error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addFaq = async (req: Request, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ message: "Question and answer are required" });

    const about = await About.findOneAndUpdate({}, { $push: { faqs: { question, answer } } }, { returnDocument: "after", upsert: true, runValidators: true });

    return res.status(201).json({ about, message: "FAQ added successfully" });
  } catch (error) {
    console.error("Add FAQ error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteFaq = async (req: Request, res: Response) => {
  try {
    const about = await About.findOneAndUpdate({}, { $pull: { faqs: { _id: req.params.id } } }, { returnDocument: "after" });

    if (!about) return res.status(404).json({ message: "About not found" });

    return res.status(200).json({ about, message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Delete FAQ error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addWhyNazarify = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description are required" });

    const about = await About.findOneAndUpdate(
      {},
      { $push: { whyNazarify: { title, description } } },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return res.status(201).json({ about, message: "Why Nazarify item added successfully" });
  } catch (error) {
    console.error("Add whyNazarify item error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteWhyNazarify = async (req: Request, res: Response) => {
  try {
    const about = await About.findOneAndUpdate(
      {},
      { $pull: { whyNazarify: { _id: req.params.id } } },
      { returnDocument: "after" }
    );

    if (!about) return res.status(404).json({ message: "About not found" });

    return res.status(200).json({ about, message: "Why Nazarify item deleted successfully" });
  } catch (error) {
    console.error("Delete whyNazarify item error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
