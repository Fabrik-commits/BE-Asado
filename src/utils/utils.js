import mongoose from "mongoose";
import { brevo } from "../config.js";
import https from "https";


function sendMail(email, subject, name, message) {
  let data = JSON.stringify({
    sender: {
      name: "FoodSpot",
      email: "food-spot-no-reply@vercel.app",
    },
    to: [
      {
        email: email,
        name: name,
      },
    ],
    subject: subject,
    htmlContent: message,
  });
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "api-key": brevo.apiKey,
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  let req = https.request(brevo.url, options, (res) => {
    res.on("data", (d) => {});
  });
  req.on("error", (e) => {
    throw e;
  });
  req.write(data);
  req.end();
}


function isValidId(id){
    if (mongoose.Types.ObjectId.isValid(id)){
        if ((String)(new mongoose.Types.ObjectId(id)) == id){
            return true;
        }
    }
    return false;
}


function removeElementfromArray(array , index = 0){
    if (typeof array != "object" || !Array.isArray(array)){
        throw new Error("array should be an Array.");
    }
    const halfBeforeElement = array.slice(0, index);
    const halfAfterElement = array.slice(index + 1);
    return halfBeforeElement.concat(halfAfterElement);
}


export {isValidId, removeElementfromArray, sendMail};
