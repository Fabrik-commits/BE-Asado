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
    const events = await Event.find().sort({ datetime: -1, ":id": 1 });
    return res.json(events);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function getPublicEvents(req, res) {
  try {
    const events = await Event.find({
      isPrivate: {
        $ne: true,
      },
    })
      .select(
        "datetime description state chef memberLimit members title ratings isPrivate penalization penalizationStartDate"
      )
      .sort({ _id: -1 })
      .populate("chef", "name")
      .populate("ratings");

    const publicEvents = reduceEventsInformation(events);

    return res.status(STATUS_CODES.OK).json(publicEvents);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
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
      .select(
        "datetime description state chef memberLimit members title ratings isPrivate penalization penalizationStartDate"
      )
      .sort({ _id: -1 })
      .populate("chef", "name")
      .populate("ratings");

    const allEvents = reduceEventsInformation(events);

    return res.status(STATUS_CODES.OK).json(allEvents);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
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
      .populate("purchaseReceipts");
    if (!event) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: eventNotFoundMessage });
    } else {
      return res.json(event);
    }
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function getMembersAndReceiptsInfo(req, res) {
  try {
    const answer = await membersWhoHaveUploaded(req.params.event);
    return res.status(STATUS_CODES.OK).json(answer);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

async function updateReminders(event) {
  const reminders = await Reminder.find({ event: event._id });
  if (reminders.length == 0) {
    const eventStartReminder = new Reminder({
      event: event._id,
      type: "eventStart",
      datetime: new Date(event.datetime - 30 * 60 * 1000), // 30 minutes before the event
    });
    await eventStartReminder.save();
    if (event.penalizationStartDate) {
      const penalizationReminderDate = new Date(event.penalizationStartDate);
      penalizationReminderDate.setDate(penalizationReminderDate.getDate() - 1);
      penalizationReminderDate.setHours(20, 0, 0, 0); // 8 PM the day before penalization starts
      const penalizationStartReminder = new Reminder({
        event: event._id,
        type: "penalizationStart",
        datetime: penalizationReminderDate, 
      });
      await penalizationStartReminder.save();
      const penalizationOneWeekReminder = new Reminder({
        event: event._id,
        type: "penalizationOneWeek",
        datetime: new Date(penalizationReminderDate.getTime() + 7 * 24 * 60 * 60 * 1000) // one week after penalization start
      });
      await penalizationOneWeekReminder.save();
    }
  }
  else {
    const eventStartReminder = reminders.find(
      (reminder) => reminder.type === "eventStart"
    );

    if (eventStartReminder) {
      eventStartReminder.datetime = new Date(event.datetime - 30 * 60 * 1000); // 30 minutes before the event
      await eventStartReminder.save();
    }

    if (event.penalizationStartDate) {
      const penalizationStartReminder = reminders.find(
        (reminder) => reminder.type === "penalizationStart"
      );
      const penalizationReminderDate = new Date(event.penalizationStartDate);
      penalizationReminderDate.setDate(penalizationReminderDate.getDate() - 1);
      penalizationReminderDate.setHours(20, 0, 0, 0); // 8 PM the day before penalization starts
      if (!penalizationStartReminder) {
        const newPenalizationStartReminder = new Reminder({
          event: event._id,
          type: "penalizationStart",
          datetime: penalizationReminderDate
        });
        await newPenalizationStartReminder.save();
        const newPenalizationOneWeekReminder = new Reminder({
          event: event._id,
          type: "penalizationOneWeek",
          datetime: new Date(penalizationReminderDate.getTime() + 7 * 24 * 60 * 60 * 1000) // one week after penalization start
        });
        await newPenalizationOneWeekReminder.save();
      } else {
        penalizationStartReminder.datetime = penalizationReminderDate;
        await penalizationStartReminder.save();
        const penalizationOneWeekReminder = reminders.find(
          (reminder) => reminder.type === "penalizationOneWeek"
        );
        penalizationOneWeekReminder.datetime = new Date(penalizationReminderDate.getTime() + 7 * 24 * 60 * 60 * 1000); // one week after penalization start
        await penalizationOneWeekReminder.save();
      }
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
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function subscribeToAnEvent(req, res) {
  try {
    if (!req.params.event)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "No event ID provided." });
    const event = await Event.findById(req.params.event).populate(
      "purchaseReceipts"
    );
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
    if (event.members.includes(req.params.id)) {
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
    event.members.push(user);
    await event.save();
    return res.status(STATUS_CODES.OK).json(event);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function unsubscribeFromEvent(req, res) {
  try {
    if (!req.params.event)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "No event ID provided." });
    const event = await Event.findById(req.params.event).populate(
      "purchaseReceipts"
    );
    if (!event)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: eventNotFoundMessage });
    const index = event.members.indexOf(req.params.id);
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
        message:
          "The user can't unsubscribe from the event if it's closed or ready for payment.",
      });
    for (const receipt of event.purchaseReceipts) {
      receipt.participants = receipt.participants.filter(
        (participantId) => !participantId.equals(user._id)
      );
      await receipt.save();
    }
    event.members.splice(index, 1);
    await event.save();
    res.status(STATUS_CODES.OK).json(event);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
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
  } catch (e) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: e.message });
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
    event.penalizationStartDate = req.body.penalizationStartDate;
    event.state = req.body.state;
    event.isPrivate = req.body.isPrivate;
    if (
      (event.shoppingDesignee.length == 0 || !event.chef) &&
      event.state !== "available"
    )
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "The event has no chef or has no shopping designees.",
      });
    await event.save();
    await updateReminders(event);
    return res.status(STATUS_CODES.OK).json(event);
  } catch (e) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: e.message });
  }
}

async function deleteReminders(eventId) {
  try {
    await Reminder.deleteMany({ event: eventId });
  } catch (e) {
    console.error("Error deleting reminders:", e);
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
  } catch (e) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: e.message });
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
    if (matches.length > 0) {
      const deletedId = matches[0].id;
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

  await Promise.all(
    event.transferReceipts.map(async (transferReceipt) => {
      if (transferReceipt.image)
        await Image.findByIdAndDelete(transferReceipt.image);
      await TransferReceipt.findByIdAndDelete(transferReceipt._id);
    })
  );

  await Promise.all(
    event.purchaseReceipts.map(async (purchaseReceipt) => {
      if (purchaseReceipt.image)
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

function reduceEventsInformation(events) {
  let reducedEvents = [];
  for (let event of events) {
    let eventRating = event.ratings
      ? event.ratings.reduce(
          (sum, currentRating) => sum + currentRating.score,
          0
        )
      : 0; // esto es porque eventos viejos no tienen el atributo
    reducedEvents.push({
      _id: event.id,
      title: event.title,
      datetime: event.datetime,
      description: event.description,
      state: event.state,
      chef: event.chef ? event.chef.name : null,
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
    const updatedAmount = Number(
      (amounts[amounts.length - 1].totalCost + payer.totalCost).toFixed(2)
    )
    amounts[amounts.length - 1].totalCost = updatedAmount
    amounts.splice(0, 1);
  }
  return transferInfo;
}


export function assignEventValues(receipts) {
  const userBalances = [];
  for (const receipt of receipts) {
    const receiptCostPerUser = Number(
      (receipt.amount / receipt.participants.length).toFixed(2)
    );
    for (const participant of receipt.participants) {
      let participantEntry = userBalances.find((a) => participant._id.equals(a.userId));
      if (participantEntry) {
        participantEntry.totalCost = Number(
          (participantEntry.totalCost - receiptCostPerUser).toFixed(2)
        );
      } else {
        userBalances.push({
          userId: participant._id,
          userName: participant.name,
          userLastName: participant.lastName,
          userCbu: participant.cbu,
          userAlias: participant.alias,
          totalCost: - receiptCostPerUser,
        });
      }
    }
    const cleanReceiptAmount = Number(
      (receiptCostPerUser * receipt.participants.length).toFixed(2)
    );
    const designeeEntry = userBalances.find((a) =>
      receipt.shoppingDesignee._id.equals(a.userId)
    );
    if (designeeEntry) {
      designeeEntry.totalCost = Number(
        (designeeEntry.totalCost + cleanReceiptAmount).toFixed(2)
      );
    } else {
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
    const userBalances = assignEventValues(event.purchaseReceipts)
    const transferInfo = calculateTransfersInfo(userBalances);
    return res.status(STATUS_CODES.OK).json(transferInfo);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}
