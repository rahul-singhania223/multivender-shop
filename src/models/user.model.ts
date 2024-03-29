import mongoose, { Schema, Model, model, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { IImage, imageSchema } from "./product.model";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  avatar: IImage;
  type: "ADMIN" | "CUSTOMER" | "VENDOR";
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
  comparePassword: (password: string) => boolean;
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
      select: false,
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
    },
    avatar: imageSchema,
    type: {
      type: String,
      required: true,
      default: "CUSTOMER",
    },
  },
  { timestamps: true }
);

userSchema.plugin(mongooseAggregatePaginate);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 8);
  }
});

userSchema.pre("updateOne", async function (next) {
  const update: { password: string } = this.getUpdate() as { password: string };

  if (update && update.password) {
    update.password = await bcrypt.hash(update.password, 8);
    next();
  }
});

userSchema.methods.generateAccessToken = function (): string {
  const accessToken = jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      avatar: this.avatar,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );

  return accessToken;
};

userSchema.methods.generateRefreshToken = function (): string {
  const refreshToken = jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      avatar: this.avatar,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "10d" }
  );

  return refreshToken;
};

userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const isValidPassword = await bcrypt.compare(password, this.password);

  return isValidPassword;
};

export const User: Model<IUser> = model("User", userSchema);
