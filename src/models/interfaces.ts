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

export interface IReminder extends Document {
  event: mongoose.Types.ObjectId;
  datetime: Date;
  type: string;
}

export interface IRating extends Document {
  score: number;
  user: mongoose.Types.ObjectId;
}

export interface IPurchaseReceipt extends Document {
  image?: mongoose.Types.ObjectId | null;
  description?: string;
  amount: number;
  event: mongoose.Types.ObjectId;
  shoppingDesignee: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
}

export interface IImage extends Document {
  name: string;
  mimetype?: string;
  image: Buffer;
}

export interface IEvent extends Document {
  name: string;
  date: Date;
  description?: string;
  title: string;
  datetime: Date;
  memberLimit: number;
  state: string;
  members: mongoose.Types.ObjectId[];
  chef?: mongoose.Types.ObjectId | null;
  organizer: mongoose.Types.ObjectId;
  shoppingDesignee?: mongoose.Types.ObjectId[] | null;
  transferReceipts: mongoose.Types.ObjectId[];
  purchaseReceipts: mongoose.Types.ObjectId[];
  ratings: mongoose.Types.ObjectId[];
  isPrivate?: boolean;
  penalization?: number | null;
  penalizationStartDate?: Date;
}
