import mongoose from "mongoose";


const imageSchema = new mongoose.Schema({

    name: {
        type: String
    },

    mimetype: {
        type: String
    },

    image: {
        type: Buffer
    }

});

const Image = mongoose.model('Image', imageSchema);


export {imageSchema as imageSchema, Image as Image};
