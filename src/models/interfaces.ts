import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  lastName?: string;
  email: string;
  alternativeEmail?: string | null;
  password: string;
  verificationCode?: string | null;
  cbu?: string | null;
  alias?: string | null;
  specialDiet: string[];
  notifications: {
    newEvent: boolean;
    eventStart: boolean;
    penalizationStart: boolean;
    penalizationOneWeek: boolean;
  };
  profilePicture?: mongoose.Types.ObjectId | null;
  generateAuthToken(): string;
  isValidPassword(password: string): Promise<boolean>;
}

