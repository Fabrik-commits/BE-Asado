import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
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
  _id: mongoose.Types.ObjectId;
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
  _id: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  datetime: Date;
  type: string;
}

export interface IRating extends Document {
  _id: mongoose.Types.ObjectId;
  score: number;
  user: mongoose.Types.ObjectId;
}

export interface IPurchaseReceipt extends Document {
  _id: mongoose.Types.ObjectId;
  image?: mongoose.Types.ObjectId | null;
  description?: string;
  amount: number;
  event: mongoose.Types.ObjectId;
  shoppingDesignee: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
}

export interface IImage extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  mimetype?: string;
  image: Buffer;
}

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
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

export interface IEventPopulated extends Omit<IEvent, "members" | "chef" | "organizer" | "shoppingDesignee" | "transferReceipts" | "purchaseReceipts" | "ratings"> {
  members: IEvent["members"];
  chef: IUser | null;
  organizer: IUser;
  shoppingDesignee: IUser[] | null;
  transferReceipts: ITransferReceipt[];
  purchaseReceipts: IPurchaseReceipt[];
  ratings: IRating[];
}

export interface IEventWithMembersTransferReceiptsPurchaseReceipts extends Omit<IEventPopulated, "members" | "transferReceipts" | "purchaseReceipts"> {
  members: IUser[];
  transferReceipts: ITransferReceipt[];
  purchaseReceipts: IPurchaseReceipt[];
}