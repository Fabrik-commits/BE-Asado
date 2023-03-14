import {Router} from "express";
import {PurchaseReceipt} from "../models/purchaseReceipt.js";


const router = Router();


router.get("/", async (req, res)=> {
    const purchaseReceipts = await PurchaseReceipt.find();
    res.send(purchaseReceipts);
});


router.get("/:id", async (req, res)=> {
    const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
    if (!purchaseReceipt) {
        res.status(404).send("The purchase receipt with the given ID was not found.");
        return;
    } else {
        res.send(purchaseReceipt);
    }
});


router.post("/", async (req, res)=> {
    let purchaseReceipt = new PurchaseReceipt(req.body)
    purchaseReceipt = await purchaseReceipt.save()
    res.send(purchaseReceipt)
});

export default router;
