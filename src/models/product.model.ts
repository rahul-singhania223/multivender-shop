import mongoose, { Document, Schema, model, Model } from "mongoose";

interface IColor {
  name: string;
  price: number;
  images: [string];
  dp: string;
}

interface IProduct {
  title: string;
  description: string;

  discount: number; // number in precentage

  colors: [IColor];
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

    colors: [
      {
        name: String,
        price: Number,
        images: [String],
        dp: String,
      },
    ],
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
