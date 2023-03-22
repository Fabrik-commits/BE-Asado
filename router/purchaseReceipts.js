import {Router} from "express";
import {PurchaseReceipt} from "../models/purchaseReceipt.js";
import {auth} from "../middleware/auth.js"
import {shoppingDesignee} from "../middleware/shoppingDesignee.js"


const router = Router();


router.get("/", auth, async (req, res)=> {
    try{
        if(!req.params.event){
            res.status(400).send("No event ID provided")
        }
        const event = await PurchaseReceipt.findById(req.params.event).populate("purchaseReceipts");
        if(!event){
            res.status(404).send("The event with the given ID was not found.")
        }
        res.send(event.purchaseReceipts);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.get("/:id", auth, async (req, res)=> {
    try{
        const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
        if (!purchaseReceipt) {
            res.status(404).send("The purchase receipt with the given ID was not found.");
            return;
        } else {
            res.send(purchaseReceipt);
        }
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.post("/", [auth, shoppingDesignee], async (req, res)=> {
    try{
        let purchaseReceipt = new PurchaseReceipt(req.body);
        purchaseReceipt = await purchaseReceipt.save();
        res.status(201).send(purchaseReceipt);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.delete("/:id", [auth, shoppingDesignee], async (req, res) => {
    try {
        const purchaseReceipt = await PurchaseReceipt.findByIdAndDelete(req.params.id)
        if (!purchaseReceipt) {
            return res.status(404).send("The purchase receipt with the given ID was not found.")
        }
        res.send(purchaseReceipt)
    } catch (e) {
        res.status(500).send(e.message)
    }
})


export default router;
