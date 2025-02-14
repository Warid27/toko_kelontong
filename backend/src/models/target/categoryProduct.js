import { Schema, model } from "mongoose";

const CategoryProductSchema = new Schema({
  name_category: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const categoryProductModels = model(
  "categoryProduct",
  categoryProductSchema,
  "categoryProduct"
);
