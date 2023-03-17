import {Router} from "express";
import {Event} from "../models/event.js";
import {auth} from "../middleware/auth.js"
import {eventOrganizer} from "../middleware/eventOrganizer.js"

const router = Router();


router.get("/", auth, async (req, res) => {
    try{
        const events = await Event.find();
        res.send(events);
    } catch(e){
        res.status(500).send(e.message);
    }
});

router.get("/public", async (req, res) => {
    try{
        const events = await Event.find().select("datetime description state chef membersLimit members").populate('chef');
        const publicEvents = [];
        for (let event of events) {
            publicEvents.push(
                {
                    _id: event.id,
                    datetime: event.datetime,
                    description: event.description,
                    state: event.state,
                    chef: event.chef ? event.chef.name : null,
                    memberLimit: event.memberLimit,
                    members: event.members.length,
                }
            );
        }
        res.send(publicEvents);
    } catch(e){
        res.status(500).send(e.message);
    }
})

router.get("/:id", auth, async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);
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
