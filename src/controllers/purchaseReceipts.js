import {PurchaseReceipt} from "../models/purchaseReceipt.js";
import {Event} from "../models/event.js";
import {saveImage} from "./images.js";


export async function getPurchaseReceiptsByEvent(req, res) {
    try{
        if(!req.params.event) return res.status(400).send("No event ID provided");
        const event = await Event.findById(req.params.event).populate("purchaseReceipts");
        if(!event) return res.status(404).send("The event with the given ID was not found.");
        return res.send(event.purchaseReceipts);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function getPurchaseReceiptById(req, res) {
    try{
        const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
        if (!purchaseReceipt) {
            return res.status(404).send("The purchase receipt with the given ID was not found.");
        } else {
            return res.send(purchaseReceipt);
        }
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function uploadFilePurchaseReceipt(req, res) {
    try{
        if (req.file){
            const imageId = await saveImage(req.file);
            let purchaseReceipt = await PurchaseReceipt.findById(req.params.purchaseReceipt);
            purchaseReceipt.image = imageId;
            await purchaseReceipt.save()
            return res.status(200).send({"imageId": imageId});
        }
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function createPurchaseReceipt(req, res) {
    try{
        let purchaseReceipt = new PurchaseReceipt(req.body);
        purchaseReceipt.event = req.params.event;
        purchaseReceipt = await purchaseReceipt.save();
        const event = await Event.findById(req.params.event);
        event.purchaseReceipts.push(purchaseReceipt);
        await event.save();
        return res.status(201).send(purchaseReceipt);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function deletePurchaseReceipt(req, res) {
    try {
        const purchaseReceipt = await PurchaseReceipt.findByIdAndDelete(req.params.id);
        if (!purchaseReceipt) return res.status(404).send("The purchase receipt with the given ID was not found.");
        const eventId = purchaseReceipt.event
        const event = await Event.findById(eventId);
        const index = event.purchaseReceipts.indexOf(purchaseReceipt._id);
        event.purchaseReceipts.splice(index, 1);
        await event.save();
        res.status(200).send(purchaseReceipt);
    } catch (e) {
        res.status(500).send(e.message);
    }
}
