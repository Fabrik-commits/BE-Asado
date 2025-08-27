import mongoose from "mongoose";
import { PurchaseReceipt } from "../models/purchaseReceipt.js";
import { Event } from "../models/event.js";
import { saveImage } from "./images.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
export async function getPurchaseReceiptsByEvent(req, res) {
    try {
        if (!req.params.event)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "No event ID provided" });
        const event = await Event.findById(req.params.event).populate([
            {
                path: "purchaseReceipts",
                populate: [
                    {
                        path: "shoppingDesignee",
                        model: "User",
                    },
                    {
                        path: "participants",
                        model: "User",
                    },
                ],
            },
        ]);
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: "The event with the given ID was not found." });
        return res.status(STATUS_CODES.OK).json(event.purchaseReceipts);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function getPurchaseReceiptById(req, res) {
    try {
        const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
        if (!purchaseReceipt) {
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "The purchase receipt with the given ID was not found.",
            });
        }
        else {
            return res.status(STATUS_CODES.OK).json(purchaseReceipt);
        }
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function uploadFilePurchaseReceipt(req, res) {
    try {
        if (req.file) {
            const imageId = await saveImage(req.file);
            let purchaseReceipt = await PurchaseReceipt.findById(req.params.purchaseReceipt);
            if (!purchaseReceipt) {
                return res.status(STATUS_CODES.NOT_FOUND).json({
                    message: "The purchase receipt with the given ID was not found.",
                });
            }
            purchaseReceipt.image = imageId;
            await purchaseReceipt.save();
            return res.status(STATUS_CODES.OK).json({ imageId: imageId });
        }
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function createPurchaseReceipt(req, res) {
    try {
        const event = await Event.findById(req.params.event);
        if (event.state !== "closed")
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "Purchase receipts can only be uploaded when the event is closed",
            });
        let purchaseReceipt = new PurchaseReceipt(req.body);
        purchaseReceipt.event = event._id;
        purchaseReceipt.shoppingDesignee = new mongoose.Types.ObjectId(req.user._id);
        purchaseReceipt.participants = req.body.participants
            ? req.body.participants
            : event.members;
        purchaseReceipt = await purchaseReceipt.save();
        event.purchaseReceipts.push(purchaseReceipt._id);
        await event.save();
        return res.status(STATUS_CODES.CREATED).json(purchaseReceipt);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function assignMembersToReceipt(req, res) {
    try {
        for (const receipt of req.body.receipts) {
            const purchaseReceipt = await PurchaseReceipt.findById(receipt.id);
            if (!purchaseReceipt)
                return res
                    .status(STATUS_CODES.NOT_FOUND)
                    .json({ message: "One or more purchase receipts were not found" });
            purchaseReceipt.participants = receipt.participants;
            await purchaseReceipt.save();
        }
        return res
            .status(STATUS_CODES.OK)
            .json({ message: "Participants assigned to receipts successfully" });
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function deletePurchaseReceipt(req, res) {
    try {
        const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
        if (!purchaseReceipt)
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "The purchase receipt with the given ID was not found.",
            });
        const event = await Event.findById(purchaseReceipt.event);
        if (event.state !== "closed")
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "Purchase receipts can only be uploaded or deleted when the event is closed",
            });
        const index = event.purchaseReceipts.indexOf(purchaseReceipt._id);
        event.purchaseReceipts.splice(index, 1);
        await event.save();
        await PurchaseReceipt.findByIdAndDelete(req.params.id);
        return res.status(STATUS_CODES.OK).json(purchaseReceipt);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
