import { Schema, model } from "mongoose";

const orderCustDetailSchema = new Schema({
  id_product: { type: Number, required: true },
  name_product: { type: String, required: true },
  quantity: { type: Number, required: true },
  price_item: { type: Number, required: true },
  total_price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  id_order_cust: { type: Number, required: true },
  id_store: { type: Number, required: true },
  id_company: { type: Number, required: true },
  id_user: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export const orderCustDetailModels = model(
  "orderCustDetail",
  orderCustDetailSchema,
  "orderCustDetail"
);
