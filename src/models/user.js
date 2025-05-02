import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { jwtPrivateKey } from "../config.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  lastName: { type: String },

  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        if (!v) return false;
        if (v == "davidmartingallegos@gmail.com") return true;
        let username, domain, rest;
        [username, domain, ...rest] = v.split("@");
        if (rest.length) return false;
        if (domain !== "endava.com") return false;
        // if (username.split(".").length < 2) return false;
        return true;
      },
      message: (props) => `${props.value} is not a valid endava email.`,
    },
  },

  alternativeEmail: {
    type: String,
    validate: {
      validator: function (v) {
        if (!v) return false;
        let username, domain, rest;
        [username, domain, ...rest] = v.split("@");
        if (rest.length) return false;
        return true;
      },
      message: (props) => `${props.value} is not a valid endava email.`,
    },
  },

  password: { type: String, required: true },

  verificationCode: { type: String, default: null },

  cbu: { type: String, default: null },

  alias: { type: String, default: null },

  specialDiet: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        const valid_diets = ["celiac", "hypertensive", "vegan", "vegetarian"];
        if (!v) return false;
        for (const diet of v) {
          if (!valid_diets.includes(diet.toLowerCase())) {
            return false;
          }
        }
        return true;
      },
    },
  },

  profilePicture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
    default: null,
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, jwtPrivateKey);
};

userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

export { userSchema as userSchema, User as User };
