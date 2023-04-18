import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({

    datetime: {
        type: Date,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    memberLimit: {
        type: Number,
        required: true
    },

    state: {
        type: String,
        required: true,
        validate: {
            validator: function(v){
                const valid_states = ["full", "closed", "available", "cancelled", "finished"];
                if (!v) return false
                if (!valid_states.includes(v.toLowerCase())){
                        return false;
                }
                return true;
            } 
        }
    },

    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },

    chef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    shoppingDesignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    transferReceipts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'TransferReceipt'
    },

    purchaseReceipts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'PurchaseReceipt'
    }

});


const Event = mongoose.model('Event', eventSchema);


export {Event as Event};
