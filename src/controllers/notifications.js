import { sendMail } from "../utils/utils.js";
import { Event } from "../models/event.js";
import { User } from "../models/user.js";
import { assignEventValues, calculateTransfersInfo } from "./events.js"
import { Reminder } from "../models/reminder.js";
import { getEventsDebtors } from "../utils/utils.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";


export async function notifyNewEvent(eventId) {
  const users = await User.find({ "notifications.newEvent": true });
  const message = `<html><head></head><body><h1>FoodSpot | New Event</h1><p>A new event has been created. <a href="https://food-spot.vercel.app/event/${eventId}">Check it out!</a></p></body></html>`;

  for (const user of users) {
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      setTimeout(() => {
          sendMail(email, "FoodSpot | New Event", user.name, message);
      }, 1000);
      console.log(`Notification sent to ${user.name} (${email}) for new event ${eventId}`);
  }
}


export async function notifyEventStart(eventId) {
  try {
    const event = await Event.findById(eventId).populate("members");
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }

    const message = `<html><head></head><body><h1>FoodSpot | An event is about to start</h1><p>The event is about to start. <a href="https://food-spot.vercel.app/event/${eventId}">Check it out!</a></p></body></html>`;
    for (const user of event.members) {
      if (!user.notifications.eventStart) continue;
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      setTimeout(() => {
          sendMail(email, "FoodSpot | Event is starting", user.name, message);
      }, 1000);
      console.log(`Notification sent to ${user.name} (${email}) for event ${eventId} start`);
    }
    return;
  } catch (error) {
    console.log(error.message);
  }
}


export async function notifyPenalizationStart(eventId) {
  try{
    const event = await Event.findById(eventId).populate("members transferReceipts purchaseReceipts");
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }
    
    const debtors = await getEventsDebtors(eventId);

    const message = `<html><head></head><body><h1>FoodSpot | Penalization is about to start</h1><p>As of today, a penalization fee of $${event.penalization} per day will apply to the final price. Consider paying the corresponding amount. <a href="https://food-spot.vercel.app/event/${eventId}">Check it here</a></p></body></html>`;
    for (const user of debtors) {
      if (!user.notifications.penalizationStart) continue;
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      setTimeout(() => {
        sendMail(email, "FoodSpot | Penalization is starting", user.name, message);
      }, 1000);
      console.log(`Notification sent to ${user.name} (${email}) for event ${eventId} penalization start`);
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function notifyPenalizationOneWeek(eventId) {
    try{
    const event = await Event.findById(eventId).populate("members transferReceipts purchaseReceipts");
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }
    
    const debtors = await getEventsDebtors(eventId);

    const message = `<html><head></head><body><h1>FoodSpot | Penalization has been going for one week</h1><p>As of today, the penalization of an event you are participating in has been ongoing for one week. Consider paying the corresponding amount. <a href="https://food-spot.vercel.app/event/${eventId}">Check it here</a></p></body></html>`;
    for (const user of debtors) {
      if (!user.notifications.penalizationOneWeek) continue;
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      setTimeout(() => {
        sendMail(email, "FoodSpot | Penalization has been going for one week", user.name, message);
      }, 1000);
      console.log(`Notification sent to ${user.name} (${email}) for event ${eventId} penalization one week`);
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function reminderCheck() {
  try {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      const reminders = await Reminder.find({ datetime: { $lte: date } });
      for (const reminder of reminders) {
        switch (reminder.type) {
          case "eventStart":
              await notifyEventStart(reminder.event);
              break;
          case "penalizationStart":
              await notifyPenalizationStart(reminder.event);
              break;
          case "penalizationOneWeek":
              await notifyPenalizationOneWeek(reminder.event);
              break;
          default:
              break;
        }
        await Reminder.findByIdAndDelete(reminder._id);
      }
      return { status: STATUS_CODES.OK, data: reminders };
  } catch (error) {
      return { status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message };
  }
}