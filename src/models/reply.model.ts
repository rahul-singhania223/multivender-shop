import { Document, Schema, model, Model } from "mongoose";

interface IReply extends Document {
  comment: string;
  createdBy: Schema.Types.ObjectId;
  review_id: Schema.Types.ObjectId;
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
    review_id: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
  },
  { timestamps: true }
);

export const Reply: Model<IReply> = model("Reply", replySchema);
