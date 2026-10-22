import mongoose from "mongoose";
import { getRequiredEnv } from "../config.js";

mongoose.set("strictQuery", true);

export async function connectDB() {
  try {
    await mongoose.connect(getRequiredEnv("DATABASE_URL"));
    console.log(`Connected to MongoDB`);
  } catch (error) {
    console.log(error);
  }
}
