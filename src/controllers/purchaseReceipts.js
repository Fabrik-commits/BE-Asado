import {PurchaseReceipt} from "../models/purchaseReceipt.js";
import {Event} from "../models/event.js";
import {saveImage} from "./images.js";


export async function getPurchaseReceiptsByEvent(req, res) {
    try{
        if(!req.params.event) return res.status(400).json({message: "No event ID provided"});
        const event = await Event.findById(req.params.event).populate("purchaseReceipts");
        if(!event) return res.status(404).json({message: "The event with the given ID was not found."});
        return res.status(200).json(event.purchaseReceipts);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function getPurchaseReceiptById(req, res) {
    try{
        const purchaseReceipt = await PurchaseReceipt.findById(req.params.id);
        if (!purchaseReceipt) {
            return res.status(404).json({message: "The purchase receipt with the given ID was not found."});
        } else {
            return res.status(200).json(purchaseReceipt);
        }
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function uploadFilePurchaseReceipt(req, res) {
    try{
        if (req.file){
            const imageId = await saveImage(req.file);
            let purchaseReceipt = await PurchaseReceipt.findById(req.params.purchaseReceipt);
            purchaseReceipt.image = imageId;
            await purchaseReceipt.save()
            return res.status(200).json({"imageId": imageId});
        }
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function createPurchaseReceipt(req, res) {
    try{
        let purchaseReceipt = new PurchaseReceipt(req.body);
        purchaseReceipt.event = req.params.event;
        purchaseReceipt.user = req.user._id
        purchaseReceipt = await purchaseReceipt.save();
        const event = await Event.findById(req.params.event);
        event.purchaseReceipts.push(purchaseReceipt);
        await event.save();
        return res.status(201).json(purchaseReceipt);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function deletePurchaseReceipt(req, res) {
    try {
        const purchaseReceipt = await PurchaseReceipt.findByIdAndDelete(req.params.id);
        if (!purchaseReceipt) return res.status(404).json({message: "The purchase receipt with the given ID was not found."});
        const eventId = purchaseReceipt.event
        const event = await Event.findById(eventId);
        const index = event.purchaseReceipts.indexOf(purchaseReceipt._id);
        event.purchaseReceipts.splice(index, 1);
        await event.save();
        return res.status(200).json(purchaseReceipt);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}


// async function calculateAmounts(eventId) {

//     Event.aggregate([
//         { $match: { _id: eventId } },
    
//         {
//             $lookup: {
//             from: 'purchaseReceipts',            // The 'purchaseReceipts' collection
//             localField: 'purchaseReceipts',  // Array of ObjectIds of receipts
//             foreignField: '_id',         // Join on the _id field in the receipts collection
//             as: 'receiptDetails'         // Result will be stored in 'receiptDetails'
//             }
//         },
        
//         { $unwind: '$receiptDetails' },
        

//         {
//             $group: {
//             _id: '$receiptDetails.user',  // Group by user who uploaded the receipt
//             totalAmount: { $sum: '$receiptDetails.amount' } // Sum the amount for each designee
//             }
//         },
        
//         // Step 5: (Optional) Lookup the user details for the designees
//         {
//             $lookup: {
//             from: 'users',          // The 'users' collection
//             localField: '_id',      // The _id from the group (which is user ID)
//             foreignField: '_id',    // Join on the _id field in the users collection
//             as: 'userDetails'       // Result will be stored in 'userDetails'
//             }
//         },

//         // Step 6: (Optional) Project the final output
//         {
//             $project: {
//             _id: 0, // Exclude the default _id field
//             shoppingDesignee: { $arrayElemAt: ['$userDetails.name', 0] }, // Designee name
//             userId: '$_id',          // Include the user ID
//             totalAmount: 1           // Include the total amount
//             }
//         }
//     ]).exec((err, result) => {
//         if (err) {
//             console.error(err);
//         } else {
//             console.log(result); // This will print the sum of amounts grouped by each shopping designee
//         }
//     });
// }


// async function calculateAmountsPopulate(eventId) {
//     const event = await Event.findById(eventId).select('purchaseReceipts').populate({
//         path: 'purchaseReceipts',
//         populate: {
//             path: 'user',
//             model: 'User'           
//         }
//     });
//     const amounts = []
//     for (const receipt in event.purchaseReceipts){
//         let existingAmount = amounts.find(a => receipt.user._id.equals(a.userId))
//         if (existingAmount){
//             existingAmount.totalAmount += receipt.amount
//         } else {
//             amounts.push({
//                 userId: receipt.user._id,
//                 userName: receipt.user.name,
//                 totalAmount: receipt.amount
//             })
//         }
//     }
    
// }
