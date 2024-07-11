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


async function hasUploaded(eventId){
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
                transferReceipt: receiptInfo[index].transferReceipt,
                hasReceiptApproved: receiptInfo[index].hasReceiptApproved,
                hasUploaded: true
            })
        } else {
            members.push({
                userId: member._id,
                userName: member.name,
                transferReceipt: null,
                hasReceiptApproved: null,
                hasUploaded: false
            })
        }
    }
    return members
}


export {isFinished, hasUploaded}
