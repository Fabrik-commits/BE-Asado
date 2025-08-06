import { Rating } from "../models/rating.js";
import { Event } from "../models/event.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";

export async function createRating(req, res) {
  try {
    const event = await Event.findById(req.params.event)
      .populate("ratings")
      .exec();
    if (!event)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "The event with the given ID was not found." });
    if (!event.members.includes(req.params.user))
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({
          message: "The user with the given ID was not found in the event.",
        });
    if (event.state == "available" || event.state == "cancelled")
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "The event is not closed or finished." });
    const rating = event.ratings.find((r) => r.user.equals(req.params.user));
    if (rating) {
      rating.score = req.body.score;
      await rating.save();
      await event.save();
      return res.status(STATUS_CODES.OK).json(rating);
    } else {
      const newRating = new Rating({
        score: req.body.score,
        user: req.params.user,
      });
      event.ratings.push(newRating);
      await newRating.save();
      await event.save();
      return res.status(STATUS_CODES.OK).json(newRating);
    }
  } catch (e) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
}

export async function getRatingFromUser(req, res) {
  try {
    const event = await Event.findById(req.params.event)
      .populate("ratings")
      .exec();
    if (!event)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "The event with the given ID was not found." });
    if (!event.members.includes(req.params.user))
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({
          message: "The user with the given ID was not found in the event.",
        });
    const rating = event.ratings.find((r) => r.user.equals(req.params.user));
    if (rating) {
      return res.status(STATUS_CODES.OK).json(rating);
    } else {
      return res
        .status(STATUS_CODES.OK)
        .json({ message: "User does not have a rating for this event." });
    }
  } catch (e) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
}
