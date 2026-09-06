import { Request, Response } from "express";
import Booking from "../models/booking";
import Service from "../models/service";
import { sendBookingConfirmationEmail } from "../utils/emailService";

export const createBooking = async (req: Request, res: Response) => {
    try {
        const { service, title, message, contact } = req.body;
        if (!service || !title || !message) return res.status(400).json({ message: "Service, title and message are required" });
        const serviceExists = await Service.exists({ _id: service, isActive: true });

        if (!serviceExists) return res.status(404).json({ message: "Service not found" });
        const existingRequest = await Booking.findOne({ user: req.user!.sub, service, status: { $in: ["pending", "reviewing", "accepted", "in_progress"] } });
        if (existingRequest) return res.status(409).json({ message: "You already have an active request for this service" });
        const booking = await Booking.create({ ...req.body, user: req.user!.sub, contact: { ...contact, name: contact?.name, email: contact?.email } });
        await sendBookingConfirmationEmail(booking.contact.email, booking.contact.name, booking.title)
            .catch((error) => console.error("Booking confirmation email error:", error));
        return res.status(201).json({ message: "Service request submitted successfully", booking });
    } catch (error) {
        console.error("Create service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const updateBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }) },
            req.body,
            { new: true, returnDocument: "after", runValidators: true }
        );
        if (!booking) return res.status(404).json({ message: "Service request not found" });

        return res.status(200).json({ message: "Service request updated successfully", booking });
    } catch (error) {
        console.error("Update service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }) });
        if (!booking) return res.status(404).json({ message: "Service request not found" });

        if (booking.status === "cancelled") {
            return res.status(400).json({ message: "This request is already cancelled" });
        }

        const isAdmin = req.user!.role === "admin";
        const cancellableStatuses = isAdmin
            ? ["pending", "reviewing", "accepted", "in_progress"]
            : ["pending", "reviewing", "accepted"];

        if (!cancellableStatuses.includes(booking.status)) {
            return res.status(400).json({ message: "This request cannot be cancelled" });
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();

        await booking.save();

        return res.status(200).json({ booking, message: "Service request cancelled successfully" });
    } catch (error) {
        console.error("Cancel service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const deleteBooking = async (req: Request, res: Response) => {
    try {
        const booking = await Booking.findOneAndDelete({ _id: req.params.id, ...(req.user!.role !== "admin" && { user: req.user!.sub }), });
        if (!booking) return res.status(404).json({ message: "Service request not found" });

        return res.status(200).json({ message: "Service request deleted successfully" });
    } catch (error) {
        console.error("Delete service request error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getUserBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.find({ user: req.user!.sub }).populate("service").sort({ createdAt: -1 });
        return res.status(200).json({ bookings });
    } catch (error) {
        console.error("Get user bookings error:", error);
        return res.status(500).json({ message: "server error" });
    }
};

export const getAdminBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await Booking.find().populate("user service").sort({ createdAt: -1 });
        return res.status(200).json({ bookings });
    } catch (error) {
        console.error("Get admin bookings error:", error);
        return res.status(500).json({ message: "server error" });
    }
};
