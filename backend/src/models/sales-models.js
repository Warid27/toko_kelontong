import { Schema, model } from "mongoose";

const salesDetailSchema = new Schema({
  id_product: { type: Schema.Types.ObjectId, ref: "product" },
  id_extras: { type: Schema.Types.ObjectId, ref: "extras", default: null },
  id_size: { type: Schema.Types.ObjectId, ref: "size", default: null },
  id_store: { type: Schema.Types.ObjectId, ref: "store" },
  id_company: { type: Schema.Types.ObjectId, ref: "company" },
  // id_user: { type: Schema.Types.ObjectId, ref: "user" },
  id_item_campaign: {
    type: Schema.Types.ObjectId,
    ref: "item_campaign",
    default: null,
  },
  product_code: { type: String, required: false },
  name: { type: String, required: true },
  item_price: { type: Number, default: null },
  item_quantity: { type: Number, default: null },
  item_discount: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const salesSchema = new Schema({
  no: { type: String, required: true },
  id_user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  id_order: { type: Schema.Types.ObjectId, ref: "order", default: null },
  id_sales_campaign: {
    type: Schema.Types.ObjectId,
    ref: "salesCampaign",
    default: null,
  },
  id_payment_type: {
    type: Schema.Types.ObjectId,
    ref: "payment_type",
    default: null,
  },
  tax: { type: Number, required: true },
  total_price: { type: Number, required: true },
  total_discount: { type: Number, default: 0 },
  total_quantity: { type: Number, required: true },
  name: { type: String, required: true },
  keterangan: { type: String },
  total_number_item: { type: Number, required: true },
  status: { type: Number, enum: [1, 2], required: true, default: 2 },
  salesDetails: [salesDetailSchema],
  created_at: { type: Date, default: Date.now },
});

export const SalesModels = model("sales", salesSchema, "sales");
