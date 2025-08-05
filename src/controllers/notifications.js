import { sendEmail } from "../utils/utils.js";
import { Event } from "../models/event.js";
import { User } from "../models/user.js";
import { Reminder } from "../models/reminder.js";
import { getEventsDebtors } from "../utils/utils.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { eventStartTemplate, newEventTemplate, penalizationStartTemplate, penalizationOneWeekTemplate } from "../utils/templates.js";


export async function notifyNewEvent(eventId) {
  const users = await User.find({ "notifications.newEvent": true });
  const message = newEventTemplate(eventId);

  for (const user of users) {
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      await sendEmail(email, "FoodSpot | Nuevo evento", user.name, message);
      console.log(`Notification sent to ${user.name} (${email}) for new event ${eventId}`);
  }
}


export async function notifyEventStart(eventId) {
  try {
    const event = await Event.findById(eventId).populate("members");
    
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found.`);
    }
    const message = eventStartTemplate(eventId);
    for (const user of event.members) {
      if (!user.notifications.eventStart) continue;
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      await sendEmail(email, "FoodSpot | Tu evento comienza pronto", user.name, message);
      console.log(`Notification sent to ${user.name} (${email}) for event ${eventId} start`);
    }
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
    const message = penalizationStartTemplate(eventId, event.penalization);
    for (const user of debtors) {
      if (!user.notifications.penalizationStart) continue;
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      await sendEmail(email, "FoodSpot | La penalización está por empezar", user.name, message);
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
    const message = penalizationOneWeekTemplate(eventId, event.penalization);

    for (const user of debtors) {
      if (!user.notifications.penalizationOneWeek) continue;
      const email = user.alternativeEmail ? user.alternativeEmail : user.email;
      await sendEmail(email, "FoodSpot | La penalización ha estado en curso durante una semana", user.name, message);
      console.log(`Notification sent to ${user.name} (${email}) for event ${eventId} penalization one week`);
    }
  } catch (error) {
    console.log(error.message);
  }
}

export async function reminderCheck(req, res) {
  try {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      const reminders = await Reminder.find({ datetime: { $lte: date } });
      for (const reminder of reminders) {
        switch (reminder.type) {
          case "eventStart":
              await notifyEventStart(reminder.event);
              console.log(`Notification sent for event start reminder for event ${reminder.event}`);
              break;
          case "penalizationStart":
              await notifyPenalizationStart(reminder.event);
              console.log(`Notification sent for penalization start reminder for event ${reminder.event}`);
              break;
          case "penalizationOneWeek":
              await notifyPenalizationOneWeek(reminder.event);
              console.log(`Notification sent for penalization one week reminder for event ${reminder.event}`);
              break;
          default:
              break;
        }
        await Reminder.findByIdAndDelete(reminder._id);
      }
      return res.status(STATUS_CODES.OK).json({ data: reminders });
  } catch (error) {
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
}