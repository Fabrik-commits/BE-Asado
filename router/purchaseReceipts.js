import {Router} from "express";
import {PurchaseReceipt} from "../models/purchaseReceipt.js";
import {auth} from "../middleware/auth.js"


const router = Router();


router.get("/", auth, async (req, res)=> {
    const purchaseReceipts = await PurchaseReceipt.find();
    res.send(purchaseReceipts);
});


router.get("/:id", auth, async (req, res)=> {
    const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
    if (!purchaseReceipt) {
        res.status(404).send("The purchase receipt with the given ID was not found.");
        return;
    } else {
        res.send(purchaseReceipt);
    }
});


router.post("/", auth, async (req, res)=> {
    try{
        let purchaseReceipt = new PurchaseReceipt(req.body)
        purchaseReceipt = await purchaseReceipt.save()
        res.send(purchaseReceipt)
    } catch(e) {
        res.send(e.message)
    }
});


export default router;
