import bcrypt from "bcrypt";
import { User } from "../models/user.js";
import { Image } from "../models/image.js";
import { Event } from "../models/event.js";
import { TransferReceipt } from "../models/transferReceipt.js";
import { hasUploaded } from "./transferReceipts.js";
import { assignEventValues, calculateTransfersInfo } from "./events.js"
import { saveImage } from "./images.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";

const userNotFoundMessage = "The user with the given ID was not found.";

export async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password -verificationCode");
    return res.status(STATUS_CODES.OK).json(users);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -verificationCode"
    );
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: userNotFoundMessage });
    } else {
      return res.status(STATUS_CODES.OK).json(user);
    }
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function isDebtor(req, res) {
  try {
    const userId = req.params.id;

    const events = await Event.find({
      members: userId,
      state: "readyforpayment",
    })
      .populate({
        path: "purchaseReceipts",
        populate: [
          { path: "shoppingDesignee", model: "User" },
          { path: "participants", model: "User" },
        ],
      })
      .populate({ path: "members", model: "User" });

    for (const event of events) {

      const userBalances = assignEventValues(event.purchaseReceipts)
      const transferInfo = calculateTransfersInfo(userBalances);

      const userTransfer = transferInfo.find(
        (t) => t.userId.equals(userId) && t.receiver
      );

      if (userTransfer) {
        const receipt = await TransferReceipt.findOne({
          event: event._id,
          user: userId,
        });

        if (!receipt) {
          return res.status(STATUS_CODES.OK).json({
            eventId: event._id,
            reason: "Transfer Receipt hasn't been uploaded yet.",
          });
        } else if (!receipt.hasPaid) {
          return res.status(STATUS_CODES.OK).json({
            eventId: event._id,
            reason: "Transfer Receipt is not approved.",
          });
        }
      }
    }

    return res.status(STATUS_CODES.OK).json({
      eventId: null,
      reason: "User has no debts.",
    });
  } catch (e) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: e.message,
    });
  }
}

export async function oldIsDebtor(req, res) {
  try {
    const userId = req.params.id;
    const eventsWithoutReceipts = await Event.find({
      members: userId,
      state: "readyforpayment",
      purchaseReceipts: { $exists: true, $ne: [] },
    });

    for (const event of eventsWithoutReceipts) {
      const eventId = event.id;
      const { hasUploaded, hasReceiptApproved } = await hasUploaded(
        userId,
        eventId
      );
      if (hasUploaded) {
        if (hasReceiptApproved) {
          continue;
        } else {
          return res.status(STATUS_CODES.OK).json({
            eventId,
            reason: "Receipt is not approved by Shopping Designee.",
          });
        }
      } else {
        return res.status(STATUS_CODES.OK).json({
          eventId,
          reason: "Transfer Receipt hasn't been uploaded yet.",
        });
      }
    }
    return res
      .status(STATUS_CODES.OK)
      .json({ eventId: null, reason: "User has no debts." });
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

async function hasToPay(userId, eventId) {
  const event = await Event.findOne(eventId).populate("purchaseReceipts");

}

export async function register(req, res) {
  try {
    req.body.email = req.body.email.toLowerCase();
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "User already registered" });
    let user = new User(req.body);
    const salt = await bcrypt.genSalt(10);
    const passwordPattern = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).{8,}$"
    );
    if (!passwordPattern.test(req.body.password)) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Password doesn't match the requirements." });
    }
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();
    return res.status(STATUS_CODES.CREATED).json(user);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function editUser(req, res) {
  try {
    let user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: userNotFoundMessage });
    user.name = req.body.name ? req.body.name : user.name;
    user.lastName = req.body.lastName ? req.body.lastName : user.lastName;
    user.alternativeEmail = req.body.alternativeEmail
      ? req.body.alternativeEmail.toLowerCase()
      : user.email;
    user.specialDiet = req.body.specialDiet;
    user.alias = req.body.alias;
    user.cbu = req.body.cbu;
    user = await user.save();
    return res.status(STATUS_CODES.OK).json(user);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function editProfilePicture(req, res) {
  try {
    if (req.file) {
      let user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: userNotFoundMessage });
      if (user.profilePicture) {
        const deletedImage = await Image.findOneAndDelete(user.profilePicture);
      }
      const imageId = await saveImage(req.file);
      user.profilePicture = imageId;
      user = await user.save();
      return res.status(STATUS_CODES.OK).json({ imageId: imageId });
    }
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user)
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: userNotFoundMessage });
    return res.status(STATUS_CODES.OK).json(user);
  } catch (e) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: e.message });
  }
}
