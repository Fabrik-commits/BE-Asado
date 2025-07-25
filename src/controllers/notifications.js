import { sendMail } from "../utils/utils.js";
import { User } from "../models/user.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";


export async function notifyNewEvent(eventId) {
    try {
        const users = await User.find({ "notifications.newEvent": true });
        const message = `<html><head></head><body><h1>FoodSpot | New Event</h1><p>A new event has been created. <a href="https://food-spot.vercel.app/event/${eventId}">Check it out!</a></p></body></html>`;
        
        for (const user of users) {
            const email = user.alternativeEmail ? user.alternativeEmail : user.email;
            setTimeout(() => {
                sendMail(email, user.name, message);
            }, 1000);
        }
        return;
    } catch (error) {
        return { status: STATUS_CODES.INTERNAL_SERVER_ERROR, message: error.message };
    }
}


export async function notifyEventStart(eventId) {

}


export async function notifyPenalizationStart(eventId) {

}

export async function notifyPenalizationOneWeek(eventId) {

}