import { Schema, model } from "mongoose";

const stockSchema = new Schema({
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const StockModels = model("stock", stockSchema, "stock");
