import {Router} from "express";
import {Event} from "../models/event.js";
import {User} from "../models/user.js";
import {auth} from "../middleware/auth.js";
import {eventOrganizer} from "../middleware/eventOrganizer.js";
import {sameUser} from "../middleware/sameUser.js";
import {getPublicEvents, getEvents} from "../services/events.service.js";


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
            .populate("shoppingDesignee")
            .populate("transferReceipts")
            .populate("purchaseReceipts");
        if (!event) {
            return res.status(404).send("The event with the given ID was not found.");
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
        event.chef = req.body.isChef ? req.body.organizer : null;
        event.shoppingDesignee = req.body.isShoppingDesignee ? req.body.organizer : null;
        event = await event.save();
        res.status(201).send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.put("/subscribeToAnEvent/:id/:event", [auth, sameUser], async (req, res) => {
    if(!req.params.event) return res.status(400).send("No event ID provided.")
    const event = await Event.findById(req.params.event);
    if(!event) return res.status(404).send("The event with the given ID was not found.");
    if(event.state !== "available") return res.status(400).send("The event is not available for users to join");
    const user = await User.findById(req.params.id);
    event.members.push(user);
    if (event.members.length == event.memberLimit) event.state = 'full';
    await event.save();
    res.status(200).send(event);
})


router.put("/unsubscribeFromEvent/:id/:event", [auth, sameUser], async (req, res) => {
    if(!req.params.event) return res.status(400).send("No event ID provided.")
    const event = await Event.findById(req.params.event);
    if(!event) return res.status(404).send("The event with the given ID was not found.");
    const index = event.members.indexOf(req.params.id);
    if (index === -1) return res.status(404).send("The member with the given ID is not part of the event.");
    if (event.members.length == event.memberLimit) event.state = 'available';
    event.members.splice(index, 1);
    await event.save();
    res.status(200).send(event);
})


router.put("/editRoles/:id", auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send("The event with the given ID was not found.");
        event.chef = req.body.chef ? req.body.chef : event.chef;
        event.shoppingDesignee = req.body.shoppingDesignee ? req.body.shoppingDesignee : event.shoppingDesignee;
        event.save();
        res.send(event);
    } catch (e) {
        res.status(500).send(e.message);
    }
})


router.put("/editEvent/:id", [auth, eventOrganizer], async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send("The event with the given ID was not found.");
        event.datetime = req.body.datetime;
        event.description = req.body.description;
        event.memberLimit = req.body.memberLimit;
        event.state = req.body.state;
        event.save();
        res.send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


router.delete('/deleteEvent/:id', [auth, eventOrganizer], async (req, res) => {
    try{
        const event = await Event.findByIdAndRemove(req.params.id);
        if (!event) return res.status(404).send('The event with the given ID was not found.');
        res.send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
});


export default router;
