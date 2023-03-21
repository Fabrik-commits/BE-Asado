import mongoose from "mongoose";


function isValidId(id){
    if (mongoose.Types.ObjectId.isValid(id)){
        if ((String)(new mongoose.Types.ObjectId(id)) == id){
            return true
        }
    }
    return false
}


export {isValidId}
