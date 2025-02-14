import { Schema, model } from "mongoose";

const salesSchema = new Schema({
  no: { type: String, required: true },
  id_user: { type: Number, required: true },
  id_store: { type: Number, required: true },
  id_company: { type: Number, required: true },
  id_order: { type: Number, required: true },
  id_sales_campaign: { type: Number, required: true },
  id_payment_type: { type: Number, required: true },
  tax: { type: Number, required: true },
  total_price: { type: Number, required: true },
  total_discount: { type: Number, required: true },
  total_quantity: { type: Number, required: true },
  total_number_item: { type: Number, required: true },
  status: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export const SalesModels = model("sales", salesSchema, "sales");
