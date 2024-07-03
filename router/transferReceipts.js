import {Router} from "express";
import {TransferReceipt} from "../models/transferReceipt.js";
import {Event} from "../models/event.js";
import {auth} from "../middleware/auth.js";
import {transferReceiptOwner} from "../middleware/transferReceiptOwner.js";
import {shoppingDesignee} from "../middleware/shoppingDesignee.js";
import {multerUpload} from "../middleware/multerUpload.js";
import {saveImage} from "../services/images.service.js";
import {isFinished, hasUploaded} from "../services/transferReceipts.service.js";


const router = Router();


router.get("/getTransferReceiptsByEvent/:event", [auth, shoppingDesignee], async (req, res)=> {
    try{
        const event = await Event.findOne(req.params.event).populate("transferReceipts");
        res.send(event.transferReceipts);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.get("/getTransferReceiptsById/:id", auth, async (req, res)=> {
    try{
        const transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt) {
            return res.status(404).send("The transfer receipt with the given ID was not found.");
        } else {
            res.send(transferReceipt);
        }
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.post("/uploadFile/:transferReceipt", [auth, multerUpload.single('file')], async (req, res) => {
    if (req.file){
        const imageId = await saveImage(req.file);
        let transferReceipt = await TransferReceipt.findById(req.params.transferReceipt);
        transferReceipt.image = imageId;
        await transferReceipt.save()
        res.status(200).send({"imageId": imageId});
    }
})


router.post("/createTransferReceipt/:event", [auth, multerUpload.single('file')], async (req, res)=> {
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
        transferReceipt = await transferReceipt.save();
        const event = await Event.findById(req.params.event);
        event.transferReceipts.push(transferReceipt);
        await event.save();
        res.status(201).send(transferReceipt);
    } catch(e) {
        res.status(500).send(e.message);
    }
});


router.put('/approveTransferReceipt/:id', [auth, shoppingDesignee], async (req, res) => {
    try {
        let transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt) return res.status(404).send('The transfer receipt with the given ID was not found.');
        if (transferReceipt.hasPaid) return res.status(400).send('The transfer receipt is already approved.')
        transferReceipt.hasPaid = true;
        await transferReceipt.save();
        if (isFinished(transferReceipt.event)) {
            const event = await Event.findById(transferReceipt.event);
            event.state = 'finished'
            await event.save()
        }
        res.send(transferReceipt);
    } catch (e) {
        res.status(500).send(e.message);
    }
})


router.delete('/deleteTransferReceipt/:id', [auth, transferReceiptOwner], async (req, res) => {
    try{
        const transferReceipt = await TransferReceipt.findByIdAndDelete(req.params.id);
        if (!transferReceipt) return res.status(404).send('The transfer receipt with the given ID was not found.');
        const eventId = transferReceipt.event
        const event = await Event.findById(eventId);
        const index = event.transferReceipts.indexOf(transferReceipt._id);
        event.transferReceipts.splice(index, 1);
        await event.save();
        res.status(200).send(transferReceipt);
    } catch(e){
        res.status(500).send(e.message);
    }
});


export default router;
