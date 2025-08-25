import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { User } from "../models/user.js";
import { adminMail } from "../config.js";
import { sendEmail } from "../utils/utils.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { passwordRecoveryTemplate } from "../utils/templates.js";
import { IUser } from "../models/interfaces.js";

const nonExistentUserMessage: string = "User does not exist.";

export async function forgot(req: Request, res: Response): Promise<Response> {
  try {
    req.body.email = req.body.email.toLowerCase();
    let user: IUser | null = await User.findOne({ email: req.body.email });
    if (!user) user = await User.findOne({ alternativeEmail: req.body.email });
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: nonExistentUserMessage });
    const code: number = Math.floor(Math.random() * 900000) + 100000;
    const salt: string = await bcrypt.genSalt(10);
    user.verificationCode = await bcrypt.hash(code.toString(), salt);
    await user.save();
    const email: string = user.alternativeEmail ? user.alternativeEmail : user.email;
    const subject: string = "FoodSpot | Recuperar contraseña";
    const message: string = passwordRecoveryTemplate(code.toString());

    await sendEmail(email, subject, user.name, message);
    return res
      .status(STATUS_CODES.OK)
      .json({ message: `Mail sent succesfully to ${email}.` });
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error." });
  }
}

export async function verifyCode(req: Request, res: Response): Promise<Response> {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user: IUser | null = await User.findOne({ email: req.body.email }).exec();
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: nonExistentUserMessage });
    const validCode: boolean = await bcrypt.compare(
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
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error." });
  }
}

export async function recover(req: Request, res: Response): Promise<Response> {
  try {
    req.body.email = req.body.email.toLowerCase();
    const user: IUser | null = await User.findOne({ email: req.body.email }).exec();
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: nonExistentUserMessage });
    if (user.verificationCode === null)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "User never requested a password change." });
    const validCode: boolean = await bcrypt.compare(
      req.body.verificationCode,
      user.verificationCode
    );
    if (!validCode)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Invalid verification code." });
    const salt: string = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.verificationCode = null;
    await user.save();
    return res
      .status(STATUS_CODES.OK)
      .json({ message: "Password was updated correctly." });
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error." });
  }
}
