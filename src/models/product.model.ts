import mongoose, { Document, Schema, model, Model, Types } from "mongoose";

export interface IImage {
  public_id: string;
  url: string;
}

export interface IProduct {
  title: string;
  description: string;
  discount: number; // number in precentage
  images: IImage[];
  dp: IImage;
  color: string;
  category: Types.ObjectId;
  sub_category: Types.ObjectId;
  owner: Schema.Types.ObjectId;
}

const imageSchema = new Schema<IImage>({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

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
      default: 0,
    },
    dp: imageSchema,
    images: [imageSchema],
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
