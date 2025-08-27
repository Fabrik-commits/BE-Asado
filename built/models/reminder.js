import mongoose from "mongoose";
const reminderSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    datetime: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                const valid_types = ["eventStart", "penalizationStart", "penalizationOneWeek"];
                if (!v)
                    return false;
                if (!valid_types.includes(v)) {
                    return false;
                }
                return true;
            },
        },
    },
});
const Reminder = mongoose.model("Reminder", reminderSchema);
export { Reminder };
