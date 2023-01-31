import mongoose from "mongoose";


const purchaseReceiptSchema = new mongoose.Schema({

    image: {
        type: String
    },

    description: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    }

});

const PurchaseReceipt = mongoose.model('Purchase-Receipt', purchaseReceiptSchema);


export {purchaseReceiptSchema as purchaseReceiptSchema, PurchaseReceipt as PurchaseReceipt};
