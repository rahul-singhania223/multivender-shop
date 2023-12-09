import { Schema, Document, Model, model, Types } from "mongoose";

export interface IAddress extends Document {
  user_id: Types.ObjectId;
  phone: string;
  pin: string;
  country: string;
  city: string;
  state: string;
  line1: string;
  line2?: string;
}

const addressSchema = new Schema<IAddress>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    line1: {
      type: String,
      required: true,
    },
    line2: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Address: Model<IAddress> = model("Address", addressSchema);
