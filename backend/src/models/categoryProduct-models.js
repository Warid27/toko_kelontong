import { Schema, model } from "mongoose";

const categoryProductSchema = new Schema({
  name_category: {
    type: String,
    required: true,
  },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const CategoryProductModels = model(
  "category_product",
  categoryProductSchema,
  "category_product"
);
