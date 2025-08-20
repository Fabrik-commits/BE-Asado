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

export interface ITransferReceipt extends Document {
  image?: mongoose.Types.ObjectId | null;
  description?: string;
  amount: number;
  hasPaid: boolean;
  paymentMethod?: string | null;
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  datetime: Date;
}
