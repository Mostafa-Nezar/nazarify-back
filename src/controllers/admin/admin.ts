import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../models/user";

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await User.find().populate("notifications").sort({ createdAt: -1 });
        return res.status(200).json({ users });
    } catch (error) {
        console.error("Get users error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "server error" });
    }
};
