import mongoose, { Model } from "mongoose";
import { IOption } from "./interfaces.js";

const optionSchema: mongoose.Schema = new mongoose.Schema<IOption>({
  title: { type: String },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Option: Model<IOption> = mongoose.model<IOption>("Option", optionSchema);

export { optionSchema, Option };
