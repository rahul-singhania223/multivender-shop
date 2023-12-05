import { Schema, Model, model, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 8);
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
    { expiresIn: "1d" }
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
