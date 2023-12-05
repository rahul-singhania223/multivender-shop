import { Document, Schema, Model, model } from "mongoose";

interface ISubCategory extends Document {
  name: string;
  category: Schema.Types.ObjectId;
}

const subCategorySchema = new Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

export const SubCategory: Model<ISubCategory> = model(
  "Category",
  subCategorySchema
);
