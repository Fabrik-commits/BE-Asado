import {Event} from "../models/event.js";

async function eventOrganizer(req, res, next){
    const event = await Event.findById(req.params.id)
    if (!(event.organizer == req.user._id)) return res.status(403).send("Access denied.");
    next();
}

export {eventOrganizer as eventOrganizer};
