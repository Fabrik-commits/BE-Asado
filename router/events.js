import {Router} from "express";
import {Event} from "../models/event.js";
import {auth} from "../middleware/auth.js"
import {eventOrganizer} from "../middleware/eventOrganizer.js"
import {getPublicEvents, getEvents} from "../services/events.service.js";

const router = Router();


router.get("/", auth, async (req, res) => {
    try{
        const events = await getEvents(req.params.limit);
        res.send(events);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.get("/public", async (req, res) => {
    try{
        const publicEvents = await getPublicEvents();
        res.send(publicEvents);
    } catch(e){
        res.status(500).send(e.message);
    }
})


router.get("/:id", auth, async (req, res) => {
    try{
        const event = await Event.findById(req.params.id)
            .populate("members")
            .populate("chef")
            .populate("organizer");
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


router.post("/", auth, async (req, res) => {
    try{
        let event = new Event(req.body);
        event = await event.save();
        res.status(201).send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.put("/:id", auth, async (req, res) => {
    try{
        const event = await Event.findByIdAndUpdate(req.params.id, {
            datetime: req.body.datetime,
            description: req.body.description,
            memberLimit: req.body.memberLimit,
            state: req.body.state,
            members: req.body.members,
            chef: req.body.chef,
            shoppingDesignee: req.body.shoppingDesignee,
            transferReceipts: req.body.transferReceipts,
            purchaseReceipts: req.body.purchaseReceipts
        }, {new: true});
        
        if (!event){
            return res.status(404).send("The genre with the given ID was not found.");
        }

        res.send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.delete('/:id', [auth, eventOrganizer], async (req, res) => {
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
