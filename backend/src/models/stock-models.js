import { Schema, model } from "mongoose";

const stockSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const StockModels = model("stock", stockSchema, "stock");
