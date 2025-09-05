import mongoose from "mongoose";
import { Event } from "../models/event.js";
import { User } from "../models/user.js";
import { TransferReceipt } from "../models/transferReceipt.js";
import { PurchaseReceipt } from "../models/purchaseReceipt.js";
import { Image } from "../models/image.js";
import { Rating } from "../models/rating.js";
import { Reminder } from "../models/reminder.js";
import { membersWhoHaveUploaded } from "./transferReceipts.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { notifyNewEvent } from "./notifications.js";
const eventNotFoundMessage = "The event with the given ID was not found.";
export async function getEvents(req, res) {
    try {
        const events = await Event.find().sort({
            datetime: -1,
            ":id": 1,
        });
        return res.json(events);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function getPublicEvents(req, res) {
    try {
        const events = await Event.find({
            isPrivate: {
                $ne: true,
            },
        })
            .select("datetime description state chef shoppingDesignee memberLimit members title ratings isPrivate penalization penalizationStartDate")
            .sort({ datetime: -1 })
            .populate("chef", "name")
            .populate("ratings")
            .populate("shoppingDesignee");
        const publicEvents = reduceEventsInformation(events);
        return res.status(STATUS_CODES.OK).json(publicEvents);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function getPublicAndPrivateEvents(req, res) {
    try {
        const events = await Event.find({
            $or: [
                {
                    isPrivate: {
                        $ne: true,
                    },
                },
                { isPrivate: true, members: req.user._id },
            ],
        })
            .select("datetime description state chef shoppingDesignee memberLimit members title ratings isPrivate penalization penalizationStartDate")
            .sort({ datetime: -1 })
            .populate("chef", "name")
            .populate("ratings")
            .populate("shoppingDesignee");
        const allEvents = reduceEventsInformation(events);
        return res.status(STATUS_CODES.OK).json(allEvents);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function getEventById(req, res) {
    try {
        const event = await Event.findById(req.params.id)
            .populate("members")
            .populate("chef")
            .populate("organizer")
            .populate("shoppingDesignee")
            .populate("transferReceipts")
            .populate("purchaseReceipts")
            .populate("options");
        if (!event) {
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        }
        else {
            return res.json(event);
        }
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function getMembersAndReceiptsInfo(req, res) {
    try {
        const answer = await membersWhoHaveUploaded(req.params.event);
        return res.status(STATUS_CODES.OK).json(answer);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
async function updateReminders(event) {
    const reminders = await Reminder.find({ event: event._id });
    const eventStartReminder = reminders.find((reminder) => reminder.type === "eventStart");
    if (eventStartReminder) {
        eventStartReminder.datetime = new Date(event.datetime.getTime() - 30 * 60 * 1000);
        await eventStartReminder.save();
    }
    else {
        const newEventStartReminder = new Reminder({
            event: event._id,
            type: "eventStart",
            datetime: new Date(event.datetime.getTime() - 30 * 60 * 1000),
        });
        await newEventStartReminder.save();
    }
    if (event.penalizationStartDate && event.penalization > 0) {
        const penalizationReminderDate = new Date(event.penalizationStartDate);
        penalizationReminderDate.setDate(penalizationReminderDate.getDate() - 1);
        penalizationReminderDate.setHours(20, 0, 0, 0); // 8 PM the day before penalization starts
        const penalizationStartReminder = reminders.find((reminder) => reminder.type === "penalizationStart");
        if (penalizationStartReminder) {
            penalizationStartReminder.datetime = penalizationReminderDate;
            await penalizationStartReminder.save();
        }
        else {
            const newPenalizationStartReminder = new Reminder({
                event: event._id,
                type: "penalizationStart",
                datetime: penalizationReminderDate,
            });
            await newPenalizationStartReminder.save();
        }
        const penalizationOneWeekReminderDate = new Date(penalizationReminderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const penalizationOneWeekReminder = reminders.find((reminder) => reminder.type === "penalizationOneWeek");
        if (penalizationOneWeekReminder) {
            penalizationOneWeekReminder.datetime = penalizationOneWeekReminderDate;
            await penalizationOneWeekReminder.save();
        }
        else {
            const newPenalizationOneWeekReminder = new Reminder({
                event: event._id,
                type: "penalizationOneWeek",
                datetime: penalizationOneWeekReminderDate,
            });
            await newPenalizationOneWeekReminder.save();
        }
    }
}
export async function createEvent(req, res) {
    try {
        let event = new Event(req.body);
        event.chef = req.body.isChef ? req.body.organizer : null;
        if (req.body.isShoppingDesignee)
            event.shoppingDesignee.push(req.body.organizer);
        event = await event.save();
        await deleteEvents();
        await notifyNewEvent(event.id);
        await updateReminders(event);
        return res.status(STATUS_CODES.CREATED).json(event);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function subscribeToAnEvent(req, res) {
    try {
        if (!req.params.event)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "No event ID provided." });
        const event = await Event.findById(req.params.event).populate("purchaseReceipts");
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        if (event.memberLimit <= event.members.length)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The event is full." });
        if (event.state !== "available")
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The event is not available for users to join" });
        if (event.members.includes(new mongoose.Types.ObjectId(req.params.id))) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The user has already joined the event" });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The user with the given ID was not found." });
        }
        for (const receipt of event.purchaseReceipts) {
            receipt.participants.push(user._id);
            await receipt.save();
        }
        event.members.push(user._id);
        await event.save();
        return res.status(STATUS_CODES.OK).json(event);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function unsubscribeFromEvent(req, res) {
    try {
        if (!req.params.event)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "No event ID provided." });
        const event = await Event.findById(req.params.event).populate("purchaseReceipts");
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        const index = event.members.indexOf(new mongoose.Types.ObjectId(req.params.id));
        if (index === -1)
            return res.status(STATUS_CODES.NOT_FOUND).json({
                message: "The member with the given ID is not part of the event.",
            });
        const user = await User.findById(req.params.id);
        if (!user) {
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The user with the given ID was not found." });
        }
        if (event.state == "closed" || event.state == "readyforpayment")
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "The user can't unsubscribe from the event if it's closed or ready for payment.",
            });
        for (const receipt of event.purchaseReceipts) {
            receipt.participants = receipt.participants.filter((participantId) => !participantId.equals(user._id));
            await receipt.save();
        }
        for (const option of event.options) {
            option.participants = option.participants.filter((participantId) => !participantId.equals(user._id));
            await option.save();
        }
        event.members.splice(index, 1);
        await event.save();
        return res.status(STATUS_CODES.OK).json(event);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function editRoles(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        event.chef = req.body.chef ? req.body.chef : null;
        event.shoppingDesignee = req.body.shoppingDesignee;
        await event.save();
        res.status(STATUS_CODES.OK).json(event);
    }
    catch (error) {
        res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
export async function editEvent(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        event.title = req.body.title;
        event.datetime = req.body.datetime;
        event.description = req.body.description;
        event.memberLimit = req.body.memberLimit;
        event.penalization = req.body.penalization;
        event.penalizationStartDate =
            req.body.penalization > 0 ? req.body.penalizationStartDate : null;
        event.state = req.body.state;
        event.isPrivate = req.body.isPrivate;
        if (event.shoppingDesignee.length == 0 && event.state !== "available")
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                message: "The event has no shopping designees.",
            });
        await event.save();
        await updateReminders(event);
        return res.status(STATUS_CODES.OK).json(event);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
async function deleteReminders(eventId) {
    try {
        await Reminder.deleteMany({ event: eventId });
    }
    catch (error) {
        console.error("Error deleting reminders:", error);
    }
}
export async function deleteEvent(req, res) {
    try {
        const event = await Event.findById(req.params.id);
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        await deleteReceipts(event._id);
        await deleteReminders(event._id);
        await Event.findByIdAndDelete(req.params.id);
        return res.status(STATUS_CODES.OK).json(event);
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
async function deleteEvents() {
    const totalEvents = await Event.count({ isPrivate: false });
    if (totalEvents > 6) {
        let matches = await Event.find({
            state: {
                $in: ["finished", "cancelled"],
            },
        }).sort({ datetime: "asc" });
        const eventsToDelete = Math.min(totalEvents - 6, matches.length);
        for (let i = 0; i < eventsToDelete; i++) {
            const deletedId = matches[0]._id;
            matches = matches.slice(1);
            await deleteReminders(deletedId);
            await deleteReceipts(deletedId);
            const deletedEvent = await Event.findByIdAndDelete(deletedId);
        }
    }
}
async function deleteReceipts(eventId) {
    const event = await Event.findById(eventId).populate([
        "transferReceipts",
        "purchaseReceipts",
        "ratings",
    ]);
    await Promise.all(event.transferReceipts.map(async (transferReceipt) => {
        if (transferReceipt.image)
            await Image.findByIdAndDelete(transferReceipt.image);
        await TransferReceipt.findByIdAndDelete(transferReceipt._id);
    }));
    await Promise.all(event.purchaseReceipts.map(async (purchaseReceipt) => {
        if (purchaseReceipt.image)
            await Image.findByIdAndDelete(purchaseReceipt.image);
        await PurchaseReceipt.findByIdAndDelete(purchaseReceipt._id);
    }));
    await Promise.all(event.ratings.map(async (rating) => {
        await Rating.findByIdAndDelete(rating);
    }));
}
function reduceEventsInformation(events) {
    let reducedEvents = [];
    for (let event of events) {
        let eventRating = event.ratings
            ? event.ratings.reduce((sum, currentRating) => sum + currentRating.score, 0)
            : 0; // esto es porque eventos viejos no tienen el atributo
        reducedEvents.push({
            _id: event._id,
            title: event.title,
            datetime: event.datetime,
            description: event.description,
            state: event.state,
            chef: event.chef ? event.chef.name : null,
            shoppingDesignee: event.shoppingDesignee,
            memberLimit: event.memberLimit,
            members: event.members.length,
            ratings: {
                avgScore: event.ratings
                    ? event.ratings.length > 0
                        ? eventRating / event.ratings.length
                        : 0
                    : 0, // esto es porque eventos viejos no tienen el atributo
                ratingsAmount: event.ratings ? event.ratings.length : 0, // esto es porque eventos viejos no tienen el atributo
            },
            isPrivate: event.isPrivate ? event.isPrivate : false, // esto es porque eventos viejos no tienen el atributo
            penalization: event.penalization ? event.penalization : null, // y asi hay backwards compatibility, SACAR CUANDO NO HAYA EVENTOS SIN ESTOS ATRIBUTOS
            penalizationStartDate: event.penalizationStartDate
                ? event.penalizationStartDate
                : null,
        });
    }
    return reducedEvents;
}
export function calculateTransfersInfo(amounts) {
    const transferInfo = [];
    while (amounts.length > 0) {
        amounts.sort((a, b) => a.totalCost - b.totalCost);
        let payer = amounts[0];
        if (payer.totalCost == 0) {
            transferInfo.push({
                userId: payer.userId,
                userName: payer.userName,
                amount: payer.totalCost,
                receiver: null,
            });
            amounts.splice(0, 1);
            continue;
        }
        let receiver = amounts[amounts.length - 1];
        transferInfo.push({
            userId: payer.userId,
            userName: payer.userName,
            amount: payer.totalCost * -1,
            receiver: {
                receiverId: receiver.userId,
                receiverName: receiver.userName,
                receiverLastName: receiver.userLastName,
                receiverCbu: receiver.userCbu,
                receiverAlias: receiver.userAlias,
            },
        });
        const updatedAmount = Number((amounts[amounts.length - 1].totalCost + payer.totalCost).toFixed(2));
        amounts[amounts.length - 1].totalCost = updatedAmount;
        amounts.splice(0, 1);
    }
    return transferInfo;
}
export function assignEventValues(receipts) {
    const userBalances = [];
    for (const receipt of receipts) {
        const receiptCostPerUser = Number((receipt.amount / receipt.participants.length).toFixed(2));
        for (const participant of receipt.participants) {
            let participantEntry = userBalances.find((a) => participant._id.equals(a.userId));
            if (participantEntry) {
                participantEntry.totalCost = Number((participantEntry.totalCost - receiptCostPerUser).toFixed(2));
            }
            else {
                userBalances.push({
                    userId: participant._id,
                    userName: participant.name,
                    userLastName: participant.lastName,
                    userCbu: participant.cbu,
                    userAlias: participant.alias,
                    totalCost: -receiptCostPerUser,
                });
            }
        }
        const cleanReceiptAmount = Number((receiptCostPerUser * receipt.participants.length).toFixed(2));
        const designeeEntry = userBalances.find((a) => receipt.shoppingDesignee._id.equals(a.userId));
        if (designeeEntry) {
            designeeEntry.totalCost = Number((designeeEntry.totalCost + cleanReceiptAmount).toFixed(2));
        }
        else {
            userBalances.push({
                userId: receipt.shoppingDesignee._id,
                userName: receipt.shoppingDesignee.name,
                userLastName: receipt.shoppingDesignee.lastName,
                userCbu: receipt.shoppingDesignee.cbu,
                userAlias: receipt.shoppingDesignee.alias,
                totalCost: cleanReceiptAmount,
            });
        }
    }
    return userBalances;
}
export async function getMembersAmount(req, res) {
    try {
        if (!req.params.event)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "No event ID provided" });
        const event = await Event.findById(req.params.event)
            .select("purchaseReceipts members")
            .populate([
            {
                path: "purchaseReceipts",
                populate: [
                    {
                        path: "shoppingDesignee",
                        model: "User",
                    },
                    {
                        path: "participants",
                        model: "User",
                    },
                ],
            },
            {
                path: "members",
                model: "User",
            },
        ]);
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        if (event.purchaseReceipts.length == 0)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "The event has no purchase receipts." });
        const userBalances = assignEventValues(event.purchaseReceipts);
        const transferInfo = calculateTransfersInfo(userBalances);
        return res.status(STATUS_CODES.OK).json(transferInfo);
    }
    catch (e) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: e.message });
    }
}
export async function getMemberIndividualCost(req, res) {
    try {
        if (!req.params.event)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "No event ID provided" });
        if (!req.params.user)
            return res
                .status(STATUS_CODES.BAD_REQUEST)
                .json({ message: "No user ID provided" });
        const event = await Event.findById(req.params.event).populate("purchaseReceipts");
        if (!event)
            return res
                .status(STATUS_CODES.NOT_FOUND)
                .json({ message: eventNotFoundMessage });
        if (!event.members.includes(new mongoose.Types.ObjectId(req.params.user)))
            return res
                .status(STATUS_CODES.FORBIDDEN)
                .json({ message: "User is not a member of the event" });
        if (event.state !== "finished" && event.state !== "readyforpayment")
            return res
                .status(STATUS_CODES.FORBIDDEN)
                .json({ message: "Event state needs to be either finished or ready for payment" });
        const userReceipts = event.purchaseReceipts.filter((receipt) => receipt.participants.some((p) => p._id.equals(new mongoose.Types.ObjectId(req.params.user))));
        const userAmount = userReceipts.reduce((total, receipt) => {
            total += (receipt.amount / receipt.participants.length);
            return total;
        }, 0);
        return res.status(STATUS_CODES.OK).json({ "userAmount": userAmount });
    }
    catch (error) {
        return res
            .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ message: error?.message || "Internal server error" });
    }
}
