import mongoose from "mongoose";


const eventSchema = mongoose.Schema({
    datetime: {
        type: Date,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    member_limit: {
        type: Number
    },

    state: {
        type: String,
        required: true,
        validate: {
            validator: function(v){
                const valid_states = ["cerrado", "bloqueado", "cancelado", "abierto"];
                if (!v) return false
                if (!valid_states.includes(v.toLowerCase())){
                        return false;
                }
                return true;
            } 
        }
    }


});

export default mongoose.model('Event', eventSchema);