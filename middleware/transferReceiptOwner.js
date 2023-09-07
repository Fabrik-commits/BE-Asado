import {TransferReceipt} from "../models/transferReceipt.js";
import {isValidId} from "../utils/utils.js";

async function transferReceiptOwner(req, res, next){
    try{
        if (!isValidId(req.params.id)){
            return res.status(400).send("Invalid ID");
        }
        const transferReceipt = await TransferReceipt.findById(req.params.id);
        if (!transferReceipt){
            return res.status(404).send("The transfer receipt with the given ID does not exist.");
        }
        if ((transferReceipt.user !== req.user._id)) return res.status(403).send("Access denied.");
        next();
    } catch(e) {
        res.status(500).send(e.message);
    }

}

export {transferReceiptOwner as transferReceiptOwner};
