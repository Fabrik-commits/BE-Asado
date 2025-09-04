import { Request, Response } from "express";
import { Option } from "../models/option.js";
import { STATUS_CODES } from "../constants/httpStatusCode.js";
import { IOption } from "../models/interfaces.js";
import mongoose from "mongoose";

export async function createOption(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const {
      title,
      participants,
    }: { title: string; participants: mongoose.Types.ObjectId[] } = req.body;

    const newOption = new Option({
      title,
      participants,
    });

    await newOption.save();

    return res.status(STATUS_CODES.CREATED).json(newOption);
  } catch (error) {
    return res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: error?.message || "Internal server error" });
  }
}
