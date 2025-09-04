import { Request, Response } from "express";
import { Option } from "../models/option.js";
import { Event } from "../models/event.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { IEvent, IOption } from "../models/interfaces.js";
import mongoose from "mongoose";

export async function createOption(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const {
      title,
      participants,
    }: { title: string; participants: mongoose.Types.ObjectId[] } = req.body;

    const newOption: IOption = new Option({
      title,
      participants,
    });

    await newOption.save();

    return res.status(STATUS_CODES.CREATED).json(newOption);
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}

export async function editOptions(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const {
      title,
      participants,
    }: { title: string; participants: mongoose.Types.ObjectId[] } = req.body;

    const updatedOption: IOption | null = await Option.findByIdAndUpdate(
      req.params.id,
      { title, participants },
      { new: true }
    );

    if (!updatedOption) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Option not found" });
    }

    return res.status(STATUS_CODES.OK).json(updatedOption);
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}

export async function deleteOption(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const deletedOption = await Option.findByIdAndDelete(req.params.id);

    if (!deletedOption) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Option not found" });
    }

    await Event.updateOne(
      { options: deletedOption._id },
      { $pull: { options: deletedOption._id } }
    );

    return res
      .status(STATUS_CODES.OK)
      .json({ message: "Option deleted successfully" });
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}

export async function getMembersWhoHaventVoted(req: Request, res: Response) {
  try {
    const event: IEvent | null = await Event.findById(req.params.event);

    if (!event) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Event not found" });
    }

    const allOptions = await Option.find({ _id: { $in: event.options } });
    const participantsInOptions = new Set<string>();
    allOptions.forEach(option => {
      option.participants.forEach((participantId: mongoose.Types.ObjectId) => {
        participantsInOptions.add(participantId.toString());
      });
    });

    const membersWhoHaventVoted = event.members.filter(
      (memberId: mongoose.Types.ObjectId) => !participantsInOptions.has(memberId.toString())
    );

    return res.status(STATUS_CODES.OK).json({ count: membersWhoHaventVoted.length });

  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
};
