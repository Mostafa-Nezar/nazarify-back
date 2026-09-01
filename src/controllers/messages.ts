import { Request, Response } from "express";
import Message from "../models/messages";

export const submitMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ message: "name, email, subject and message are required" });

    const doc = await Message.create({ name, email, subject, message, ...(req.user?.sub && { user: req.user.sub })});

    return res.status(201).json({ message: "Message sent successfully", data: doc });
  } catch (error) {
    console.error("Submit message error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await Message.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const doc = await Message.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Message not found" });
    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
