import { Document, Schema, Model, model } from "mongoose";

interface ICategory extends Document {
  name: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> = model("Category", categorySchema);
