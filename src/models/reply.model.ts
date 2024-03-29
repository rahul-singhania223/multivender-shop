import { Document, Schema, model, Model, Types } from "mongoose";

export interface IReply extends Document {
  comment: string;
  product_id: Types.ObjectId;
  createdBy: Types.ObjectId;
  review_id: Types.ObjectId;
}

const replySchema = new Schema<IReply>(
  {
    comment: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    review_id: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
  },
  { timestamps: true }
);

export const Reply: Model<IReply> = model("Reply", replySchema);
