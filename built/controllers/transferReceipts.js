import { TransferReceipt } from "../models/transferReceipt.js";
import { Event } from "../models/event.js";
import { saveImage } from "./images.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { assignEventValues, calculateTransfersInfo } from "../controllers/events.js";
import mongoose from "mongoose";
const transferReceiptNotFoundMessage = "The transfer receipt with the given ID was not found.";
const cannotCreateTransferReceiptMessage = "You can only create transfer receipts when the event is ready for payment.";
export async function getTransferReceiptsByEvent(req, res) {
    try {
        const event = await Event.findById(req.params.event).populate("transferReceipts");
        return res.status(STATUS_CODES.OK).json(event.transferReceipts);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function getTransferReceiptsById(req, res) {
    try {
        const transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: transferReceiptNotFoundMessage });
        }
        else {
            return res.status(STATUS_CODES.OK).json(transferReceipt);
        }
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function uploadFileTransferReceipt(req, res) {
    try {
        if (req.file) {
            const imageId = await saveImage(req.file);
            const transferReceipt = await TransferReceipt.findById(req.params.transferReceipt);
            transferReceipt.image = imageId;
            await transferReceipt.save();
            return res.status(STATUS_CODES.OK).json({ imageId: imageId });
        }
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function createTransferReceipt(req, res) {
    try {
        const hasUploadedValue = await hasUploaded(req.body.user, req.params.event);
        const event = await Event.findById(req.params.event);
        if (event.state !== "readyforpayment")
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: cannotCreateTransferReceiptMessage,
            });
        if (hasUploadedValue.hasUploaded) {
            const oldTransferReceipt = await TransferReceipt.findByIdAndRemove(hasUploadedValue.transferReceipt);
            const index = event.transferReceipts.indexOf(oldTransferReceipt._id);
            event.transferReceipts.splice(index, 1);
            await event.save();
        }
        let transferReceipt = new TransferReceipt(req.body);
        transferReceipt.event = new mongoose.Types.ObjectId(req.params.event);
        let date = new Date();
        date.setHours(date.getHours() - 3);
        transferReceipt.datetime = date;
        transferReceipt = await transferReceipt.save();
        event.transferReceipts.push(transferReceipt._id);
        await event.save();
        return res.status(STATUS_CODES.CREATED).json(transferReceipt);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error." });
    }
}
export async function approvePaymentWithoutReceipt(req, res) {
    try {
        const hasUploadedValue = await hasUploaded(req.params.user, req.params.event);
        if (hasUploadedValue.hasUploaded) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The user has uploaded a transfer receipt" });
        }
        let transferReceipt = new TransferReceipt();
        const date = new Date();
        date.setHours(date.getHours() - 3);
        transferReceipt.datetime = date;
        transferReceipt.amount = 0;
        transferReceipt.event = new mongoose.Types.ObjectId(req.params.event);
        transferReceipt.user = new mongoose.Types.ObjectId(req.params.user);
        transferReceipt.hasPaid = true;
        transferReceipt = await transferReceipt.save();
        const event = await Event.findById(req.params.event);
        event.transferReceipts.push(transferReceipt._id);
        await event.save();
        if (await isFinished(req.params.event)) {
            event.state = "finished";
            await event.save();
        }
        return res.status(STATUS_CODES.CREATED).json(transferReceipt);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error.message || "Internal server error." });
    }
}
export async function approveTransferReceipt(req, res) {
    try {
        const transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: transferReceiptNotFoundMessage });
        if (transferReceipt.hasPaid)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The transfer receipt is already approved." });
        transferReceipt.hasPaid = true;
        await transferReceipt.save();
        if (await isFinished(transferReceipt.event.toString())) {
            const event = await Event.findById(transferReceipt.event);
            event.state = "finished";
            await event.save();
        }
        return res.status(STATUS_CODES.OK).json(transferReceipt);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error.message || "Internal server error." });
    }
}
export async function deleteTransferReceipt(req, res) {
    try {
        const transferReceipt = await TransferReceipt.findByIdAndDelete(req.params.id);
        if (!transferReceipt)
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: transferReceiptNotFoundMessage,
            });
        const eventId = transferReceipt.event;
        const event = await Event.findById(eventId);
        if (event.state !== "readyforpayment")
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: cannotCreateTransferReceiptMessage,
            });
        const index = event.transferReceipts.indexOf(transferReceipt._id);
        event.transferReceipts.splice(index, 1);
        await event.save();
        return res.status(STATUS_CODES.OK).json(transferReceipt);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error.message || "Internal server error." });
    }
}
export async function isFinished(eventId) {
    const event = await Event.findById(new mongoose.Types.ObjectId(eventId))
        .populate({
        path: "transferReceipts",
    })
        .populate({
        path: "purchaseReceipts",
        populate: [
            { path: "shoppingDesignee", model: "User" },
            { path: "participants", model: "User" },
        ],
    })
        .populate({ path: "members", model: "User" });
    const userBalances = assignEventValues(event.purchaseReceipts);
    const transferInfo = calculateTransfersInfo(userBalances);
    const expectedTransfers = transferInfo.filter((t) => t.receiver !== null);
    const approvedTransfers = event.transferReceipts.filter((r) => r.hasPaid === true);
    return expectedTransfers.length === approvedTransfers.length;
}
export async function membersWhoHaveUploaded(eventId) {
    const event = await Event.findById(eventId).populate("members transferReceipts");
    const membersWithReceipts = [];
    const receiptInfo = [];
    for (let receipt of event.transferReceipts) {
        membersWithReceipts.push(String(receipt.user));
        receiptInfo.push({
            hasReceiptApproved: receipt.hasPaid,
            transferReceipt: receipt._id,
        });
    }
    const members = [];
    for (let member of event.members) {
        if (membersWithReceipts.includes(String(member._id))) {
            const index = membersWithReceipts.indexOf(String(member._id));
            members.push({
                userId: member._id,
                userName: member.name,
                userLastName: member.lastName,
                specialDiet: member.specialDiet,
                transferReceipt: receiptInfo[index].transferReceipt,
                hasReceiptApproved: receiptInfo[index].hasReceiptApproved,
                hasUploaded: true,
            });
        }
        else {
            members.push({
                userId: member._id,
                userName: member.name,
                userLastName: member.lastName,
                specialDiet: member.specialDiet,
                transferReceipt: null,
                hasReceiptApproved: null,
                hasUploaded: false,
            });
        }
    }
    return members;
}
export async function hasUploaded(userId, eventId) {
    const event = await Event.findById(new mongoose.Types.ObjectId(eventId)).populate("transferReceipts");
    for (const receipt of event.transferReceipts) {
        if (receipt.user.equals(new mongoose.Types.ObjectId(userId))) {
            return {
                hasUploaded: true,
                hasReceiptApproved: receipt.hasPaid,
                transferReceipt: receipt._id,
            };
        }
    }
    return {
        hasUploaded: false,
        hasReceiptApproved: false,
        transferReceipt: null,
    };
}
