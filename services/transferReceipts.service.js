import {TransferReceipt} from "../models/transferReceipt.js";
import {Event} from "../models/event.js";


async function isFinished(eventId){
    const event = await Event.findById(eventId).populate("transferReceipts")
    for (receipt of event.transferReceipts){
        if (!receipt.hasPaid) {
            return false
        }
    }
    return true
}


async function hasUploaded(userId, eventId){
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


export {isFinished, hasUploaded}
