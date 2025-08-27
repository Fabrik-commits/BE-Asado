import mongoose from "mongoose";
const ratingSchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
        validate: {
            validator: function (v) {
                if (!v)
                    return false;
                if (![1, 2, 3, 4, 5].includes(v))
                    return false;
                return true;
            },
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});
const Rating = mongoose.model("Rating", ratingSchema);
export { Rating };
