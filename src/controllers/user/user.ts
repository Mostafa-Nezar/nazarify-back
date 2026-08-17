import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/user";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.sub);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.sub,
      { $set: { ...req.body, ...(req.file && { avatar: req.file.path }) } },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Current password and new password are required" });

    const user = await User.findById(req.user?.sub).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.password) return res.status(400).json({ message: "Password change is unavailable for this account" });

    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "server error" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.user?.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.clearCookie("token");
    return res.status(200).json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({ message: "server error" });
  }
};
