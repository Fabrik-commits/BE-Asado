import { Rating } from "../models/rating.js";
import { Event } from "../models/event.js";


export async function createRating(req, res) {
    try {
        const event = await Event.findById(req.params.event).populate('ratings').exec();
        if (!event) return res.status(404).json({message: "The event with the given ID was not found."});
        if (!event.members.includes(req.params.user)) return res.status(400).json({message: "The user with the given ID was not found in the event."});
        if ((event.state == "available") || (event.state == 'cancelled')) return res.status(400).json({message: "The event is not closed or finished."})
        const rating = event.ratings.find(r => r.user.equals(req.params.user));
        if (rating) {
            rating.score = req.body.score;
            await rating.save();
            return res.status(200).json(rating)
        } else {
            const newRating = new Rating({
                score: req.body.score,
                user: req.params.user
            })
            await newRating.save()
            return res.status(200).json(newRating)
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
}


export async function getRatingFromUser(req, res) {
    const event = await Event.findById(req.params.event).populate('ratings').exec();
    if (!event) return res.status(404).json({message: "The event with the given ID was not found."});
    if (!event.members.includes(req.params.user)) return res.status(400).json({message: "The user with the given ID was not found in the event."});
    const rating = event.ratings.find(r => r.user.equals(req.params.user));
    if (rating) {
        return res.status(200).json(rating)
    } else {
        return res.status(200).json({message: "User does not have a rating for this event."})
    }
}
