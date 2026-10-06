import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../models/user";
import Admin, { IAdmin } from "../../models/admin";

const SUPER_ADMIN_EMAIL = "mn2@gmail.com";
const ADMIN_PERMISSIONS = ["projects", "services", "offers", "skills", "tools", "bookings", "users", "about", "messages", "contact", "partners", "notifications", "privacy-policy", "terms-of-service", "pages"];

const getActor = async (req: Request) => Admin.findById(req.user!.sub);
const canManageAdmins = (actor: IAdmin) => actor.role === "master_admin" || actor.role === "super_admin";
const canManageMasters = (actor: IAdmin) => actor.role === "super_admin";
const sanitizePermissions = (permissions: unknown) => Array.isArray(permissions) ? [...new Set(permissions.filter((item): item is string => typeof item === "string" && ADMIN_PERMISSIONS.includes(item)))] : undefined;
const isProtectedAdmin = (admin: IAdmin) => admin.email === SUPER_ADMIN_EMAIL || admin.role === "super_admin";
const canManageTarget = (actor: IAdmin, target: IAdmin) => target.role === "admin" ? canManageAdmins(actor) : target.role === "master_admin" ? canManageMasters(actor) : false;

const ensureSuperAdmin = async (admin: IAdmin) => {
    if (admin.email !== SUPER_ADMIN_EMAIL || admin.role === "super_admin") return admin;
    admin.role = "super_admin";
    await admin.save();
    return admin;
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const admin = await getActor(req);
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        await ensureSuperAdmin(admin);
        return res.status(200).json({ admin });
    } catch (error) {
        console.error("Get admin error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const actor = await getActor(req);
        if (!actor || !canManageAdmins(actor)) return res.status(403).json({ message: "Access denied" });
        const admins = await Admin.find({ role: "admin" }).sort({ createdAt: -1 });
        return res.status(200).json({ admins });
    } catch (error) {
        console.error("Get admins error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getMasters = async (req: Request, res: Response) => {
    try {
        const actor = await getActor(req);
        if (!actor || !canManageMasters(actor)) return res.status(403).json({ message: "Access denied" });
        const masters = await Admin.find({ role: "master_admin" }).sort({ createdAt: -1 });
        return res.status(200).json({ masters });
    } catch (error) {
        console.error("Get masters error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const updateAdmin = async (req: Request, res: Response) => {
    try {
        const actor = await getActor(req);
        if (!actor) return res.status(404).json({ message: "Admin not found" });

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid admin id" });

        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        if (isProtectedAdmin(admin) || admin._id.equals(actor._id) || !canManageTarget(actor, admin)) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (typeof req.body.isActive === "boolean") admin.isActive = req.body.isActive;
        const permissions = sanitizePermissions(req.body.permissions);
        if (permissions !== undefined) admin.permissions = permissions;
        if (canManageMasters(actor) && (req.body.role === "admin" || req.body.role === "master_admin")) admin.role = req.body.role;

        await admin.save();
        return res.status(200).json({ admin });
    } catch (error) {
        console.error("Update admin error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const actor = await getActor(req);
        if (!actor) return res.status(404).json({ message: "Admin not found" });

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid admin id" });

        const admin = await Admin.findById(id);
        if (!admin) return res.status(404).json({ message: "Admin not found" });
        if (isProtectedAdmin(admin) || admin._id.equals(actor._id) || !canManageTarget(actor, admin)) {
            return res.status(403).json({ message: "Access denied" });
        }

        await admin.deleteOne();
        return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Delete admin error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

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
