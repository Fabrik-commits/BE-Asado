import {Event} from "../models/event.js";
import {isValidId} from "../utils/utils.js";

async function eventParticipant(req, res, next){
    try{
        if (!isValidId(req.params.id)){
            return res.status(400).send("Invalid ID");
        }
        const event = await Event.findById(req.params.id);
        if (!event){
            return res.status(404).send("The event with the given ID does not exist.");
        }
        if (!(event.members.includes(req.user._id))) return res.status(403).send("Access denied.");
        next();
    } catch(e) {
        res.status(500).send(e.message);
    }

}

export {eventParticipant as eventParticipant};