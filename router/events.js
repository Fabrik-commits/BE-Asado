import {Router} from "express";
import {Event} from "../models/event.js";
import {auth} from "../middleware/auth.js"
import {eventOrganizer} from "../middleware/eventOrganizer.js"
import {sameUser} from "../middleware/sameUser.js"
import {getPublicEvents, getEvents} from "../services/events.service.js";
import {removeElementfromArray} from "../utils/utils.js"

const router = Router();


router.get("/getEvents", auth, async (req, res) => {
    try{
        const events = await getEvents(req.params.limit);
        res.send(events);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.get("/getPublicEvents", async (req, res) => {
    try{
        const publicEvents = await getPublicEvents();
        res.send(publicEvents);
    } catch(e){
        res.status(500).send(e.message);
    }
})


router.get("/getEventById/:id", auth, async (req, res) => {
    try{
        const event = await Event.findById(req.params.id)
            .populate("members")
            .populate("chef")
            .populate("organizer")
            .populate("transferReceipts")
            .populate("purchaseReceipts");
        if (!event) {
            res.status(404).send("The event with the given ID was not found.");
            return;
        } else {
            res.send(event);
        }
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.post("/createEvent", auth, async (req, res) => {
    try{
        let event = new Event(req.body);
        event.chef = req.body.isChef ? req.body.organizer : null
        event.shoppingDesignee = req.body.isShoppingDesignee ? req.body.organizer : null
        event = await event.save();
        res.status(201).send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.put("unsubscribeFromEvent/:id/:event", [auth, sameUser], async (req, res) => {
    if(!req.params.event) return res.status(400).send("No event ID provided.")
    const event = await Event.findById(req.params.event);
    if(!event) return res.status(404).send("The event with the given ID was not found.")
    const memberIndex = event.members.indexOf(req.params.id)
    if (memberIndex === -1) return res.status(404).send("The member with the given ID is not part of the event.")
    event.members = removeElementfromArray(event.members, memberIndex)
    await event.save()
    res.status(200).send(event)
})


router.put("/editEvent/:id", [auth, eventOrganizer], async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);
        if (!event){
            return res.status(404).send("The event with the given ID was not found.");
        }
        let state = req.body.state
        switch (true) {
            case event.memberLimit > req.body.members.length && event.state === "full":
                state = "available";
                break;
            case event.memberLimit == req.body.members.length && event.state === "available":
                state = "full"
                break;
            case event.memberLimit < req.body.members.length:
                return res.status(400).send("The event member limit has been met.")
            default:
                break;
        }
        event.members = req.body.members

        event.datetime = req.body.datetime
        event.description = req.body.description
        event.memberLimit = req.body.memberLimit
        event.state = state
        event.chef = req.body.chef
        event.shoppingDesignee = req.body.shoppingDesignee

        event.save()
        res.send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.delete('/deleteEvent/:id', [auth, eventOrganizer], async (req, res) => {
    try{
        const event = await Event.findByIdAndRemove(req.params.id);
        if (!event){
            res.status(404).send('The event with the given ID was not found.');
            return;
        }
        res.send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


export default router;
