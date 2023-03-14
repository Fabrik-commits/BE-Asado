import {Router} from "express";
import {TransferReceipt} from "../models/transferReceipt.js";


const router = Router();


router.get("/", async (req, res)=> {
    const transferReceipts = await TransferReceipt.find();
    res.send(transferReceipts);
});


router.get("/:id", async (req, res)=> {
    const transferReceipt = await TransferReceipt.findById(req.id);
    if (!transferReceipt) {
        res.status(404).send("The transfer receipt with the given ID was not found.");
        return;
    } else {
        res.send(transferReceipt);
    }
});


router.post("/", async (req, res)=> {
    let transferReceipt = new TransferReceipt(req.body)
    transferReceipt = await transferReceipt.save()
    res.send(transferReceipt)
});

export default router;
