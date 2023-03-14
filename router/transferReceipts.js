import {Router} from "express";
import {TransferReceipt} from "../models/transferReceipt.js";
import {auth} from "../middleware/auth.js"


const router = Router();


router.get("/", auth, async (req, res)=> {
    const transferReceipts = await TransferReceipt.find();
    res.send(transferReceipts);
});


router.get("/:id", auth, async (req, res)=> {
    const transferReceipt = await TransferReceipt.findById(req.params.id);
    if (!transferReceipt) {
        res.status(404).send("The transfer receipt with the given ID was not found.");
        return;
    } else {
        res.send(transferReceipt);
    }
});


router.post("/", auth, async (req, res)=> {
    try {
        let transferReceipt = new TransferReceipt(req.body)
        transferReceipt = await transferReceipt.save()
        res.send(transferReceipt)
    } catch(e) {
        res.send(e.message)
    }
});


export default router;
