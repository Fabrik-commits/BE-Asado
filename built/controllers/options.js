import { Option } from "../models/option.js";
import { Event } from "../models/event.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
export async function createOption(req, res) {
    try {
        const { title, participants, } = req.body;
        const newOption = new Option({
            title,
            participants,
        });
        await newOption.save();
        return res.status(STATUS_CODES.CREATED).json(newOption);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function editOptions(req, res) {
    try {
        const { title, participants, } = req.body;
        const updatedOption = await Option.findByIdAndUpdate(req.params.id, { title, participants }, { new: true });
        if (!updatedOption) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: "Option not found" });
        }
        return res.status(STATUS_CODES.OK).json(updatedOption);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function deleteOption(req, res) {
    try {
        const deletedOption = await Option.findByIdAndDelete(req.params.id);
        if (!deletedOption) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: "Option not found" });
        }
        await Event.updateOne({ options: deletedOption._id }, { $pull: { options: deletedOption._id } });
        return res
            .status(STATUS_CODES.OK)
            .json(deletedOption);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function getMembersWhoHaventVoted(req, res) {
    try {
        const event = await Event.findById(req.params.event);
        if (!event) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: "Event not found" });
        }
        const allOptions = await Option.find({ _id: { $in: event.options } });
        const participantsInOptions = new Set();
        allOptions.forEach(option => {
            option.participants.forEach((participantId) => {
                participantsInOptions.add(participantId.toString());
            });
        });
        const membersWhoHaventVoted = event.members.filter((memberId) => !participantsInOptions.has(memberId.toString()));
        return res.status(STATUS_CODES.OK).json({ count: membersWhoHaventVoted.length });
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
;
