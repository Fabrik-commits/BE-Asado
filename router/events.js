import {Router} from "express";
import {Event} from "../models/event.js";


const router = Router();


router.get("/", async (req, res) => {
    const events = await Event.find();
    res.send(events);
});


router.get("/:id", async (req, res) => {
    const event = await Event.findById(req.id);
    if (!event) {
        res.status(404).send("The event with the given ID was not found.");
        return;
    } else {
        res.send(event);
    }
});

router.post("/", async (req, res) => {
    let event = new Event(req.body)
    event = await event.save()
    res.send(event)
});

export default router;
