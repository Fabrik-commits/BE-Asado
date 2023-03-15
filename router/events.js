import {Router} from "express";
import {Event} from "../models/event.js";
import {auth} from "../middleware/auth.js"

const router = Router();


router.get("/", async (req, res) => {
    const events = await Event.find();
    res.send(events);
});


router.get("/:id", async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
        res.status(404).send("The event with the given ID was not found.");
        return;
    } else {
        res.send(event);
    }
});


router.post("/", auth, async (req, res) => {
    try{
        let event = new Event(req.body)
        event = await event.save()
        res.send(event)
    } catch(e){
        res.send(e.message)
    }
});


router.delete('/:id', auth, async (req, res) => {
    try{
        res.status(501).send("Not programmed yet :)");
        return
        const event = await Event.findByIdAndRemove(req.params.id)
        if (!event){
            res.status(404).send('The event with the given ID was not found.');
            return;
        }
        res.send(event);
    } catch(e){
        res.status(500).send(e.message)
    }
});


export default router;
