import mongoose from "mongoose";


const purchaseReceiptSchema = new mongoose.Schema({

    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
        default: null
    },

    description: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },

    shoppingDesignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    participants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    }

});


const PurchaseReceipt = mongoose.model('PurchaseReceipt', purchaseReceiptSchema);


export {purchaseReceiptSchema as purchaseReceiptSchema, PurchaseReceipt as PurchaseReceipt};
