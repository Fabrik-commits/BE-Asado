import mongoose from "mongoose";
import { Rating } from "../models/rating.js";
import { Event } from "../models/event.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { Request, Response } from "express";
import { IRating, IEvent } from "../models/interfaces.js";

interface IEventWithRatings extends Omit<IEvent, "ratings"> {
  ratings: IRating[];
}

export async function createRating(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const event: IEventWithRatings | null = await Event.findById(
      req.params.event
    ).populate("ratings");
    if (!event)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "The event with the given ID was not found." });
    if (!event.members.includes(new mongoose.Types.ObjectId(req.params.user)))
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "The user with the given ID was not found in the event.",
      });
    if (event.state == "available" || event.state == "cancelled")
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "The event is not closed or finished." });
    const rating: IRating | undefined = event.ratings.find((r) =>
      r.user.equals(req.params.user)
    );
    if (rating) {
      rating.score = req.body.score;
      await rating.save();
      await event.save();
      return res.status(STATUS_CODES.OK).json(rating);
    } else {
      const newRating: IRating = new Rating({
        score: req.body.score,
        user: req.params.user,
      });
      event.ratings.push(newRating);
      await newRating.save();
      await event.save();
      return res.status(STATUS_CODES.OK).json(newRating);
    }
  } catch (error: any) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}

export async function getRatingFromUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const event: IEventWithRatings | null = await Event.findById(
      req.params.event
    ).populate("ratings");
    if (!event)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "The event with the given ID was not found." });
    if (!event.members.includes(new mongoose.Types.ObjectId(req.params.user)))
      return res.status(STATUS_CODES.BAD_REQUEST).json({
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
  } catch (error: any) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}
