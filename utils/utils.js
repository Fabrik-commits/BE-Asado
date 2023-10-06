import mongoose from "mongoose";


function isValidId(id){
    if (mongoose.Types.ObjectId.isValid(id)){
        if ((String)(new mongoose.Types.ObjectId(id)) == id){
            return true;
        }
    }
    return false;
}


function removeElementfromArray(array , index = 0){
    if (typeof array != "object" || !Array.isArray(array)){
        throw new Error("array should be an Array.");
    }
    const halfBeforeElement = array.slice(0, index);
    const halfAfterElement = array.slice(index + 1);
    return halfBeforeElement.concat(halfAfterElement);
}


export {isValidId, removeElementfromArray};
