import { Schema, Document, Model, model, Types } from "mongoose";

export interface IReview extends Document {
  title: string;
  comment: string;
  product_id: Types.ObjectId;
  createdBy: Types.ObjectId;
}

const reviewSchema = new Schema<IReview>(
  {
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

export const Review: Model<IReview> = model("Review", reviewSchema);
