import {Event} from "../models/event.js";
import {User} from "../models/user.js";
import {membersWhoHaveUploaded} from "./transferReceipts.js";

export async function getEvents(req, res) {
    try{
        const events = await Event.find().sort({"datetime": -1, ":id": 1}).limit(limit);
        return res.send(events);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function getPublicEvents(req, res){
    try{
        const events = await Event
            .find()        
            .select("datetime description state chef memberLimit members title")
            .sort({"_id": -1})
            .populate("chef", "name");
        const publicEvents = [];
        for (let event of events) {
            publicEvents.push(
                {
                    _id: event.id,
                    title: event.title,
                    datetime: event.datetime,
                    description: event.description,
                    state: event.state,
                    chef: event.chef ? event.chef.name : null,
                    memberLimit: event.memberLimit,
                    members: event.members.length,
                }
            );
        }
        return res.send(publicEvents);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function getEventById(req, res) {
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
            return res.send(event);
        }
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function getMembersAndReceiptsInfo(req, res) {
    try{
        const answer = await membersWhoHaveUploaded(req.params.event);
        return res.status(200).send(answer);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function createEvent(req, res) {
    try{
        let event = new Event(req.body);
        event.chef = req.body.isChef ? req.body.organizer : null;
        event.shoppingDesignee = req.body.isShoppingDesignee ? req.body.organizer : null;
        if (event.memberLimit == 1) event.state == 'full'
        event = await event.save();
        await deleteEvents()
        return res.status(201).send(event);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function subscribeToAnEvent(req, res) {
    try{
        if(!req.params.event) return res.status(400).send("No event ID provided.");
        const event = await Event.findById(req.params.event);
        if(!event) return res.status(404).send("The event with the given ID was not found.");
        if(event.state !== "available") return res.status(400).send("The event is not available for users to join");
        if (event.members.includes(req.params.id) ){
            return res.status(400).send("The user has already joined the event");
        }
        const user = await User.findById(req.params.id);
        event.members.push(user);
        if (event.members.length == event.memberLimit) event.state = 'full';
        await event.save();
        return res.status(200).send(event);
    } catch (e) {
        return res.status(500).send(e.message);
    }
}


export async function unsubscribeFromEvent(req, res) {
    try {
        if(!req.params.event) return res.status(400).send("No event ID provided.");
        const event = await Event.findById(req.params.event);
        if(!event) return res.status(404).send("The event with the given ID was not found.");
        const index = event.members.indexOf(req.params.id);
        if (index === -1) return res.status(404).send("The member with the given ID is not part of the event.");
        if (event.members.length == event.memberLimit) event.state = 'available';
        event.members.splice(index, 1);
        await event.save();
        res.status(200).send(event);
    } catch(e){
        return res.status(500).send(e.message);
    }
}


export async function editRoles(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).send("The event with the given ID was not found.");
        event.chef = req.body.chef ? req.body.chef : null;
        event.shoppingDesignee = req.body.shoppingDesignee ? req.body.shoppingDesignee : null;
        await event.save();
        res.send(event);
    } catch (e) {
        res.status(500).send(e.message);
    }
}


export async function editEvent (req, res) {
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
}


export async function deleteEvent(req, res) {
    try{
        const event = await Event.findByIdAndRemove(req.params.id);
        if (!event) return res.status(404).send('The event with the given ID was not found.');
        res.send(event);
    } catch(e){
        res.status(500).send(e.message);
    }
}


async function deleteEvents(){
    const totalEvents = await Event.count()
    if (totalEvents > 6){
        let matches = await Event.find({"state": "finished"}).sort({datetime: "asc"})
        if (matches.length > 0) {
            const deletedId = matches[0].id
            const deleted = await Event.deleteOne({_id: deletedId})
        }
    } 
}

export function test(req, res){
    let dos = 1 + 1
    res.send(dos)
}
