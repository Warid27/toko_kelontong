import { Schema, model } from "mongoose";

const salesDetailSchema = new Schema({
  id_sales: { type: Number, required: true },
  id_product: { type: Number, required: true },
  id_store: { type: Number, required: true },
  id_company: { type: Number, required: true },
  id_user: { type: Number, required: true },
  id_item_campaign: { type: Number, required: true },
  product_code: { type: String, required: false },
  name_product: { type: String, required: true },
  item_price: { type: Number, default: null },
  item_quantity: { type: Number, default: null },
  item_discount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export const salesDetailModels = model(
  "salesDetail",
  salesDetailSchema,
  "salesDetail"
);
