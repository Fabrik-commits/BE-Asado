import mongoose from "mongoose";
const optionSchema = new mongoose.Schema({
    title: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});
const Option = mongoose.model("Option", optionSchema);
export { optionSchema, Option };
