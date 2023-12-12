import { Document, Schema, model, Model, Types } from "mongoose";

interface ICart extends Document {
  product_id: Types.ObjectId;
  createdBy: Types.ObjectId;
}

const cartSchema = new Schema<ICart>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Cart: Model<ICart> = model("Cart", cartSchema);
