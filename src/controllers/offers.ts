import { Request, Response } from "express";
import Offer from "../models/offers";
import NotificationService from "../utils/notificationService";

export const createOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.create({ ...req.body, createdBy: (req as any).user.sub, });
    await NotificationService.notifyNewOffer(req.body.service?.title as any || "a service", offer.code, offer.discount);
    return res.status(201).json({ offer, msg: "Offer created successfully" });
  } catch (error) {
    console.error("Create offer error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
}

export const getOffers = async (req: Request, res: Response) => {
  try {
    const { service, active } = req.query;
    const filter: Record<string, unknown> = {};
    if (service) filter.service = service;

    if (active === "true") {
      filter.isActive = true;
      filter.startAt = { $lte: new Date() };
      filter.endAt = { $gte: new Date() };
      filter.$or = [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usageCount", "$usageLimit"] } },
      ];
    }

    const offers = await Offer.find(filter).populate("service", "name title slug").sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 });

    return res.status(200).json({ offers });
  } catch (error) {
    console.error("Get offers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findById(req.params.id).populate("service", "name title slug");
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    return res.status(200).json({ offer });
  } catch (error) {
    console.error("Get offer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    return res.status(200).json({ offer, msg: "Offer updated successfully" });
  } catch (error) {
    console.error("Update offer error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ msg: "Offer not found" });
    return res.status(200).json({ msg: "Offer deleted successfully" });
  } catch (error) {
    console.error("Delete offer error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
};

export const getServiceOffers = async (req: Request, res: Response) => {
  try {
    const offers = await Offer.find({
      service: req.params.serviceId,
      isActive: true,
      startAt: { $lte: new Date() }, endAt: { $gte: new Date() },
      $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } }],
    }).sort({ isFeatured: -1, sortOrder: 1, createdAt: -1 });
    return res.status(200).json({ offers });
  } catch (error) {
    console.error("Get service offers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const validateOffer = async (req: Request, res: Response) => {
  try {
    const { code, service, price } = req.body;
    if (!code || !service || price == null) return res.status(400).json({ message: "Code, service and price are required" });
    const offer = await Offer.findOne({ code: code.toUpperCase(), service, isActive: true, startAt: { $lte: new Date() }, endAt: { $gte: new Date() }, $or: [{ usageLimit: { $exists: false } }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } }], });
    if (!offer) return res.status(404).json({ message: "Invalid or expired offer" });
    if (offer.minPrice && price < offer.minPrice) return res.status(400).json({ message: `Minimum price is ${offer.minPrice}` });
    const discount = offer.discountType === "percentage" ? Math.min((price * offer.discount) / 100, offer.maxDiscount ?? Infinity) : Math.min(offer.discount, price);
    return res.status(200).json({ valid: true, offer, discount, finalPrice: price - discount, });
  } catch (error) {
    console.error("Validate offer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
