import {TransferReceipt} from "../models/transferReceipt.js";
import {Event} from "../models/event.js";
import {saveImage} from "./images.js";


export async function getTransferReceiptsByEvent (req, res) {
    try{
        const event = await Event.findOne(req.params.event).populate("transferReceipts");
        return res.status(200).json(event.transferReceipts);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function getTransferReceiptsById(req, res) {
    try{
        const transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt) {
            return res.status(404).json({message: "The transfer receipt with the given ID was not found."});
        } else {
            return res.status(200).json(transferReceipt);
        }
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function uploadFileTransferReceipt(req, res) {
    try{
        if (req.file){
            const imageId = await saveImage(req.file);
            let transferReceipt = await TransferReceipt.findById(req.params.transferReceipt);
            transferReceipt.image = imageId;
            await transferReceipt.save();
            return res.status(200).json({"imageId": imageId});
        }
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function createTransferReceipt(req, res) {
    try {
        const hasUploadedValue = await hasUploaded(req.body.user, req.params.event)
        if (hasUploadedValue.hasUploaded){
            let oldTransferReceipt = await TransferReceipt.findByIdAndRemove(hasUploadedValue.transferReceipt);
            let event = await Event.findById(req.params.event);
            const index = event.transferReceipts.indexOf(oldTransferReceipt);
            event.transferReceipts.splice(index, 1);
            await event.save();
        }
        let transferReceipt = new TransferReceipt(req.body);
        transferReceipt.event = req.params.event;
        let date = new Date();
        date.setHours(date.getHours() - 3);
        transferReceipt.datetime = date.toISOString();
        transferReceipt = await transferReceipt.save();
        const event = await Event.findById(req.params.event);
        event.transferReceipts.push(transferReceipt);
        await event.save();
        return res.status(201).json(transferReceipt);
    } catch(e) {
        return res.status(500).json({message: e.message});
    }
}

export async function approvePaymentWithoutReceipt(req, res) {
    try{
        const hasUploadedValue = await hasUploaded(req.params.user, req.params.event);
        if (hasUploadedValue.hasUploaded){
            return res.status(400).json({message: "The user has uploaded a transfer receipt"});
        }
        let transferReceipt = new TransferReceipt();
        let date = new Date();
        date.setHours(date.getHours() - 3);
        transferReceipt.datetime = date.toISOString();
        transferReceipt.amount = 0
        transferReceipt.event = req.params.event
        transferReceipt.user = req.params.user
        transferReceipt.hasPaid = true
        transferReceipt = await transferReceipt.save();
        const event = await Event.findById(req.params.event);
        event.transferReceipts.push(transferReceipt);
        await event.save();
        if (await isFinished(req.params.event)) {
            event.state = 'finished'
            await event.save();
        }
        return res.status(201).json(transferReceipt);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function approveTransferReceipt(req, res) {
    try {
        let transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt) return res.status(404).json({message: 'The transfer receipt with the given ID was not found.'});
        if (transferReceipt.hasPaid) return res.status(400).json({message: 'The transfer receipt is already approved.'})
        transferReceipt.hasPaid = true;
        await transferReceipt.save();
        if (await isFinished(transferReceipt.event)) {
            const event = await Event.findById(transferReceipt.event);
            event.state = 'finished'
            await event.save()
        }
        return res.status(200).json(transferReceipt);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}


export async function deleteTransferReceipt(req, res) {
    try{
        const transferReceipt = await TransferReceipt.findByIdAndDelete(req.params.id);
        if (!transferReceipt) return res.status(404).json({message: 'The transfer receipt with the given ID was not found.'});
        const eventId = transferReceipt.event
        const event = await Event.findById(eventId);
        const index = event.transferReceipts.indexOf(transferReceipt._id);
        event.transferReceipts.splice(index, 1);
        await event.save();
        return res.status(200).json(transferReceipt);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function isFinished(eventId){
    const event = await Event.findById(eventId).populate("transferReceipts")
    if (event.members.length - 1 > event.transferReceipts.length) return false
    for (let receipt of event.transferReceipts){
        if (!receipt.hasPaid) {
            return false
        }
    }
    return true
}


export async function membersWhoHaveUploaded(eventId){
    const event = await Event.findById(eventId).populate("members transferReceipts");
    const membersWithReceipts = []
    const receiptInfo = []
    for (let receipt of event.transferReceipts){
        membersWithReceipts.push(String(receipt.user))
        receiptInfo.push({
            hasReceiptApproved: receipt.hasPaid,
            transferReceipt: receipt._id
        })
    }
    const members = []
    for (let member of event.members){
        if (membersWithReceipts.includes(String(member._id))){
            const index = membersWithReceipts.indexOf(String(member._id))
            members.push({
                userId: member._id,
                userName: member.name,
                specialDiet: member.specialDiet,
                userLastName: member.lastName,
                transferReceipt: receiptInfo[index].transferReceipt,
                hasReceiptApproved: receiptInfo[index].hasReceiptApproved,
                hasUploaded: true
            })
        } else {
            members.push({
                userId: member._id,
                userName: member.name,
                userLastName: member.lastName,
                specialDiet: member.specialDiet,
                transferReceipt: null,
                hasReceiptApproved: null,
                hasUploaded: false
            })
        }
    }
    return members
}


export async function hasUploaded(userId, eventId){
    const event = await Event.findById(eventId).populate("transferReceipts");
    for (const receipt of event.transferReceipts){
        if (receipt.user == userId){
            return {
                hasUploaded: true,
                hasReceiptApproved: receipt.hasPaid,
                transferReceipt: receipt._id
            };
        }
    }
    return {
        hasUploaded: false,
        hasReceiptApproved: false,
        transferReceipt: null
    };
}
