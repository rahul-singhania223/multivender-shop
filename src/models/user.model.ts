import { Schema, Model, model, Document } from "mongoose";

interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  avatar: string;
  type: "ADMIN" | "CUSTOMER" | "VENDOR";
  refreshToken: string;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
    },
    avatar: {
      type: String,
      required: [true, "avatar is required"],
    },
    type: {
      type: String,
      default: "CUSTOMER",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> = model("User", userSchema);
