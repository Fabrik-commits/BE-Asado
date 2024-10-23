import {Event} from "../models/event.js";
import {User} from "../models/user.js";
import {TransferReceipt} from "../models/transferReceipt.js";
import {PurchaseReceipt} from "../models/purchaseReceipt.js";
import {Image} from "../models/image.js";
import {membersWhoHaveUploaded} from "./transferReceipts.js";
import {Rating} from "../models/rating.js";


export async function getEvents(req, res) {
    try{
        const events = await Event.find().sort({"datetime": -1, ":id": 1});
        return res.json(events);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function getPublicEvents(req, res){
    try{
        const events = await Event
            .find(
                {isPrivate: {
                    $ne: true
                }}
            )
            .select("datetime description state chef memberLimit members title ratings isPrivate penalization penalizationStartDate")
            .sort({"_id": -1})
            .populate("chef", "name")
            .populate("ratings");

        const publicEvents = reduceEventsInformation(events);
        
        return res.status(200).json(publicEvents);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function getPublicAndPrivateEvents(req, res){
    try{
        const events = await Event
            .find(
                {
                    $or: [
                        {isPrivate: {
                            $ne: true
                        }},
                        {isPrivate: true, members: req.user._id}
                    ]
                }
            )
            .select("datetime description state chef memberLimit members title ratings isPrivate penalization penalizationStartDate")
            .sort({"_id": -1})
            .populate("chef", "name")
            .populate("ratings");

        const allEvents = reduceEventsInformation(events);

        return res.status(200).json(allEvents);
    } catch(e){
        return res.status(500).json({message: e.message});
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
            return res.status(404).json({message: "The event with the given ID was not found."});
        } else {
            return res.json(event);
        }
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function getMembersAndReceiptsInfo(req, res) {
    try{
        const answer = await membersWhoHaveUploaded(req.params.event);
        return res.status(200).json(answer);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function createEvent(req, res) {
    try{
        let event = new Event(req.body);
        event.chef = req.body.isChef ? req.body.organizer : null;
        event.shoppingDesignee = req.body.isShoppingDesignee ? req.body.organizer : null;
        event = await event.save();
        await deleteEvents()
        return res.status(201).json(event);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function subscribeToAnEvent(req, res) {
    try{
        if(!req.params.event) return res.status(400).json({message: "No event ID provided."});
        const event = await Event.findById(req.params.event);
        if(!event) return res.status(404).json({message: "The event with the given ID was not found."});
        if(event.memberLimit <= event.members.length) return res.status(400).json({message: "The event is full."})
        if(event.state !== "available") return res.status(400).json({message: "The event is not available for users to join"});
        if (event.members.includes(req.params.id) ){
            return res.status(400).json({message: "The user has already joined the event"});
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json({message: "The user with the given ID was not found."})
        }
        event.members.push(user);
        await event.save();
        return res.status(200).json(event);
    } catch (e) {
        return res.status(500).json({message: e.message});
    }
}


export async function unsubscribeFromEvent(req, res) {
    try {
        if(!req.params.event) return res.status(400).json({message: "No event ID provided."});
        const event = await Event.findById(req.params.event);
        if(!event) return res.status(404).json({message: "The event with the given ID was not found."});
        const index = event.members.indexOf(req.params.id);
        if (index === -1) return res.status(404).json({message: "The member with the given ID is not part of the event."});
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(400).json({message: "The user with the given ID was not found."})
        }
        event.members.splice(index, 1);
        await event.save();
        res.status(200).json(event);
    } catch(e){
        return res.status(500).json({message: e.message});
    }
}


export async function editRoles(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({message: "The event with the given ID was not found."});
        event.chef = req.body.chef ? req.body.chef : null;
        event.shoppingDesignee = req.body.shoppingDesignee ? req.body.shoppingDesignee : null;
        await event.save();
        res.status(200).json(event);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


export async function editEvent (req, res) {
    try{
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({message: "The event with the given ID was not found."});
        event.title = req.body.title;
        event.datetime = req.body.datetime;
        event.description = req.body.description;
        event.memberLimit = req.body.memberLimit;
        event.isPrivate = req.body.isPrivate;
        event.save();
        res.status(200).json(event);
    } catch(e){
        res.status(500).json({message: e.message});
    }
}


export async function deleteEvent(req, res) {
    try{
        deleteReceipts(req.params.id)
        const event = await Event.findByIdAndRemove(req.params.id);
        if (!event) return res.status(404).json({message: 'The event with the given ID was not found.'});
        res.status(200).json(event);
    } catch(e){
        res.status(500).json(e.message);
    }
}


async function deleteEvents(){
    const totalEvents = await Event.count({isPrivate: false});
    if (totalEvents > 6){
        let matches = await Event.find({
                "state": {
                    $in: ["finished", "cancelled"]
                }
            }).sort({datetime: "asc"});
        if (matches.length > 0) {
            const deletedId = matches[0].id;
            await deleteReceipts(deletedId);
            const deletedEvent = await Event.findByIdAndDelete(deletedId);
        }
    } 
}

async function deleteReceipts(eventId) {
    const event = await Event.findById(eventId).populate(["transferReceipts", "purchaseReceipts", "ratings"]);

    await Promise.all(
        event.transferReceipts.map(async (transferReceipt) => {
            await Image.findByIdAndDelete(transferReceipt.image);
            await TransferReceipt.findByIdAndDelete(transferReceipt._id);
        })
    );

    await Promise.all(
        event.purchaseReceipts.map(async (purchaseReceipt) => {
            await Image.findByIdAndDelete(purchaseReceipt.image);
            await PurchaseReceipt.findByIdAndDelete(purchaseReceipt._id);
        })
    );
    await Promise.all(
        event.ratings.map(async (rating) => {
            await Rating.findByIdAndDelete(rating);
        })
    );
}

function reduceEventsInformation (events){
    let reducedEvents = []
    for (let event of events) {
        let eventRating = event.ratings ? event.ratings.reduce((sum, currentRating) => sum + currentRating.score, 0) : 0 // esto es porque eventos viejos no tienen el atributo
        reducedEvents.push(
            {
                _id: event.id,
                title: event.title,
                datetime: event.datetime,
                description: event.description,
                state: event.state,
                chef: event.chef ? event.chef.name : null,
                memberLimit: event.memberLimit,
                members: event.members.length,
                ratings: {
                    avgScore: event.ratings ? (event.ratings.length > 0 ? (eventRating / event.ratings.length) : 0) : 0, // esto es porque eventos viejos no tienen el atributo
                    ratingsAmount: event.ratings ? event.ratings.length : 0 // esto es porque eventos viejos no tienen el atributo
                },
                isPrivate: event.isPrivate ? event.isPrivate : false, // esto es porque eventos viejos no tienen el atributo 
                penalization: event.penalization ? event.penalization : null, // y asi hay backwards compatibility, SACAR CUANDO NO HAYA EVENTOS SIN ESTOS ATRIBUTOS
                penalizationStartDate: event.penalizationStartDate ? event.penalizationStartDate : null
            }
        );
    }
    return reducedEvents
}
