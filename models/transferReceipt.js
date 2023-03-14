import mongoose from "mongoose";


const transferReceiptSchema = new mongoose.Schema({

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
    },

    hasPaid: {
        type: Boolean,
        default: false
    },

    paymentMethod: {
        type: String
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

});


const TransferReceipt = mongoose.model('Transfer-Receipt', transferReceiptSchema);


export {transferReceiptSchema as transferReceiptSchema, TransferReceipt as TransferReceipt};
