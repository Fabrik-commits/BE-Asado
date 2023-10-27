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


export {isFinished}
