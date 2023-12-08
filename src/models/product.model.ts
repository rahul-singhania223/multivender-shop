import mongoose, { Document, Schema, model, Model } from "mongoose";

interface IProduct {
  title: string;
  description: string;
  discount: number; // number in precentage
  images: [string];
  dp: string;
  color: string;
  category: Schema.Types.ObjectId;
  sub_category: Schema.Types.ObjectId;
  owner: Schema.Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: Number, // number in percentage
    },
    dp: {
      required: true,
      type: String,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    color: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    sub_category: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> = model("Product", productSchema);
