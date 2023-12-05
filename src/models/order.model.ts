import { Document, model, Model, Schema } from "mongoose";

interface IOrder extends Document {
  product_id: Schema.Types.ObjectId;
  orderedBy: Schema.Types.ObjectId;
  ownedBy: Schema.Types.ObjectId;
  status:
    | "PENDING"
    | "PACKED"
    | "OUT FOR DELIVERY"
    | "CANCELLED"
    | "RETURNED"
    | "DELIVERED";
  payment_mode: "UPI" | "CARD" | "COD";
  isPaid: boolean;
  quantity: number;
  final_price: number;
  discount: number; // number in percentage
}

const orderSchema = new Schema<IOrder>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "PACKED",
        "OUT FOR DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ],
    },
    payment_mode: {
      type: String,
      required: true,
      enum: ["UPI", "COD", "CARD"],
    },
    isPaid: {
      type: Boolean,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    final_price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = model("Order", orderSchema);
