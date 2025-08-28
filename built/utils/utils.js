import mongoose from "mongoose";
import { brevo } from "../config.js";
import https from "https";
import { Event } from "../models/event.js";
import { assignEventValues, calculateTransfersInfo, } from "../controllers/events.js";
function sendEmail(email, subject, name, htmlContent) {
    const payload = JSON.stringify({
        sender: {
            name: "FoodSpot",
            email: "food-spot-no-reply@5865554.brevosend.com",
        },
        to: [{ email, name }],
        subject,
        htmlContent,
    });
    const byteLength = Buffer.byteLength(payload, "utf8");
    const options = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "api-key": brevo.apiKey,
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": byteLength,
        },
    };
    return new Promise((resolve, reject) => {
        const req = https.request(brevo.url, options, (res) => {
            res.on("data", () => { });
            res.on("end", () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve();
                }
                else {
                    reject(new Error(`Brevo error: ${res.statusCode}`));
                }
            });
        });
        req.on("error", reject);
        req.write(payload, "utf8");
        req.end();
    });
}
function isValidId(id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
        if (String(new mongoose.Types.ObjectId(id)) == id) {
            return true;
        }
    }
    return false;
}
async function getEventsDebtors(eventId) {
    const event = await Event.findById(eventId).populate([
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
        {
            path: "transferReceipts",
            populate: {
                path: "user",
                model: "User",
            },
        },
    ]);
    if (!event) {
        throw new Error(`Event with ID ${eventId} not found.`);
    }
    const userBalances = assignEventValues(event.purchaseReceipts);
    const transferInfo = calculateTransfersInfo(userBalances);
    const expectedTransfers = transferInfo.filter((t) => t.receiver !== null);
    const debtorUsers = await Promise.all(expectedTransfers.map(async (transfer) => {
        const receipt = event.transferReceipts.find((r) => r.user._id.equals(transfer.userId));
        if (!receipt) {
            return receipt.user;
        }
        return null;
    }));
    const debtors = debtorUsers.filter((user) => user !== null);
    return debtors;
}
export { isValidId, sendEmail, getEventsDebtors };
