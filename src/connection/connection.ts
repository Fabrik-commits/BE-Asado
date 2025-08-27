import mongoose from "mongoose";

mongoose.set("strictQuery", true);

export async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log(`Connected to MongoDB`);
  } catch (error) {
    console.log(error);
  }
}
