import { Request, Response } from "express";
import ServiceRequest from "../models/service-request";
import Service from "../models/service";

export const createServiceRequest = async (req: Request, res: Response) => {
    try {
        const { service, title, message, budget, deadline, attachments, contact } = req.body;
        if (!service || !title || !message) return res.status(400).json({ message: "Service, title and message are required" });
        const serviceExists = await Service.exists({ _id: service, isActive: true });

        if (!serviceExists) return res.status(404).json({ message: "Service not found" });
        const existingRequest = await ServiceRequest.findOne({ user: req.user!.sub, service, status: { $in: ["pending", "reviewing", "accepted", "in_progress"] } });
        if (existingRequest) return res.status(409).json({ message: "You already have an active request for this service" });
        const request = await ServiceRequest.create({ ...req.body, user: req.user!.sub, contact: { ...contact, name: contact?.name, email: contact?.email } });
        return res.status(201).json({ message: "Service request submitted successfully", request });
    } catch (error) {
        console.error("Create service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getServiceRequests = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const perPage = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const filter: Record<string, any> = req.user!.role === "admin" ? {} : { user: req.user!.sub };
        if (status) filter.status = status;
        const skip = (currentPage - 1) * perPage;
        const [requests, total] = await Promise.all([
            ServiceRequest.find(filter).populate("service", "title slug image").sort({ createdAt: -1 }).skip(skip).limit(perPage),
            ServiceRequest.countDocuments(filter),
        ]);

        const pages = Math.ceil(total / perPage);

        return res.status(200).json({ requests, pagination: { page: currentPage, limit: perPage, total, pages, hasNextPage: currentPage < pages, hasPreviousPage: currentPage > 1, }, });
    } catch (error) {
        console.error("Get  service requests error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getServiceRequest = async (req: Request, res: Response) => {
    try {
        const request = await ServiceRequest.findOne({
            _id: req.params.id,
            ...(req.user!.role !== "admin" && { user: req.user!.sub }),
        }).populate("service", "title slug description image");

        if (!request) return res.status(404).json({ message: "Service request not found" });
        return res.status(200).json({ request });
    } catch (error) {
        console.error("Get  service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const updateServiceRequest = async (req: Request, res: Response) => {
    try {
        const request = await ServiceRequest.findOneAndUpdate({ _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }), }, req.body, { new: true, runValidators: true });
        if (!request) return res.status(404).json({ message: "Service request not found" });

        return res.status(200).json({ message: "Service request updated successfully", request });
    } catch (error) {
        console.error("Update service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const cancelServiceRequest = async (req: Request, res: Response) => {
    try {
        const request = await ServiceRequest.findOne({ _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }), });
        if (!request) return res.status(404).json({ message: "Service request not found" });
        if (!["pending", "reviewing", "accepted"].includes(request.status))
            return res.status(400).json({ message: "This request cannot be cancelled", });

        request.status = "cancelled";
        request.cancelledAt = new Date();

        await request.save();

        return res.status(200).json({ request, message: "Service request cancelled successfully" });
    } catch (error) {
        console.error("Cancel service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const rateServiceRequest = async (req: Request, res: Response) => {
    try {
        const { rating, review } = req.body;
        if (!rating || !review) return res.status(400).json({ message: "Rating and review are required" });
        const request = await ServiceRequest.findOne({ _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }), });
        if (!request) return res.status(404).json({ message: "Service request not found" });
        if (request.status !== "completed") return res.status(400).json({ message: "This request cannot be rated" });
        request.rating = rating;
        request.review = review;
        await request.save();
        return res.status(200).json({ request, message: "Service request rated successfully" });
    } catch (error) {
        console.error("Rate service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const deleteServiceRequest = async (req: Request, res: Response) => {
    try {
        const request = await ServiceRequest.findOneAndDelete({ _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }), });
        if (!request) return res.status(404).json({ message: "Service request not found" });

        return res.status(200).json({ message: "Service request deleted successfully" });
    } catch (error) {
        console.error("Delete service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};
