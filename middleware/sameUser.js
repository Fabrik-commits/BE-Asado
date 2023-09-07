import {isValidId} from "../utils/utils.js";

async function sameUser(){
    try{
        if (!isValidId(req.user._id) || !isValidId(req.params.id)){
            return res.status(400).send("Invalid ID");
        }
        if ((req.params.id !== req.user._id)) return res.status(403).send("Access denied.");
        next();
    } catch(e) {
        res.status(500).send(e.message);
    }
}

export {sameUser as sameUser}
