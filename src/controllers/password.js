import bcrypt from "bcrypt";
import https from "https";
import { User } from "../models/user.js";
import { adminMail, brevo } from "../config.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";

const nonExistentUserMessage = "User does not exist.";

export async function forgot(req, res) {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: nonExistentUserMessage });
    const code = Math.floor(Math.random() * 900000) + 100000;
    const salt = await bcrypt.genSalt(10);
    user.verificationCode = await bcrypt.hash(code.toString(), salt);
    await user.save();
    const dummyMessage = `<html><head></head><body><h1>FoodSpot</h1><p>${user.name} ${user.lastName} con el mail ${user.email} pidio recuperar contraseña. Su código es ${code}</p></body></html>`;
    setTimeout(() => {
      sendMail(adminMail, "Admin", dummyMessage);
    }, 1000);
    const message = `<html><head></head><body><h1>FoodSpot | Password recovery</h1><p>If you requested a password change insert this code into the prompted page:</p><h4>${code}</h4><p>If you didn't request a password change you can ignore this email.</p></body></html>`;
    setTimeout(() => {
      sendMail(user.email, user.name, message);
    }, 1000);
    return res
      .status(STATUS_CODES.OK)
      .json({ message: `Mail sent succesfully to ${user.email}.` });
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
}

export async function verifyCode(req, res) {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: nonExistentUserMessage });
    const validCode = await bcrypt.compare(
      req.body.verificationCode,
      user.verificationCode
    );
    if (validCode) {
      return res
        .status(STATUS_CODES.OK)
        .json({ message: "Verification code is correct." });
    } else {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json("Invalid verification code.");
    }
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
}

export async function recover(req, res) {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: nonExistentUserMessage });
    if (user.verificationCode === null)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "User never requested a password change." });
    const validCode = await bcrypt.compare(
      req.body.verificationCode,
      user.verificationCode
    );
    if (!validCode)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Invalid verification code." });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.verificationCode = null;
    await user.save();
    return res
      .status(STATUS_CODES.OK)
      .json({ message: "Password was updated correctly." });
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
}

function sendMail(email, name, message) {
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
    subject: "FoodSpot | Password recovery",
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
