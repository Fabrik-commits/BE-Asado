import {Router} from "express";
import {Event} from "../models/event.js";
import {auth} from "../middleware/auth.js"

const router = Router();


router.get("/", async (req, res) => {
    try{
        const events = await Event.find();
        res.send(events);
    } catch(e){
        res.status(500).send(e.message)
    }
});


router.get("/:id", async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);
        if (!event) {
            res.status(404).send("The event with the given ID was not found.");
            return;
        } else {
            res.send(event);
        }
    } catch(e){
        res.status(500).send(e.message)
    }
});


router.post("/", auth, async (req, res) => {
    try{
        let event = new Event(req.body)
        event = await event.save()
        res.send(event)
    } catch(e){
        res.status(500).send(e.message)
    }
});


export default router;
