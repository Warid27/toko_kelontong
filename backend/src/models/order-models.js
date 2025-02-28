import { Schema, model } from "mongoose";

const orderDetailSchema = new Schema({
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
    default: null,
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    default: null,
  },
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  id_extrasDetails: {
    type: Schema.Types.ObjectId,
    ref: "extras",
    default: null,
  },
  id_sizeDetails: {
    type: Schema.Types.ObjectId,
    ref: "size",
    default: null,
  },
  name_product: { type: String, required: true },
  quantity: { type: Number, required: true },
  price_item: { type: Number, required: true },
  total_price: { type: Number, required: true },
  discount: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
});

const orderSchema = new Schema({
  no: { type: String, required: true },
  code: { type: String, required: true },
  person_name: { type: String, required: true },
  status: { type: Number, enum: [1, 2], required: true, default: 2 },
  order_status: { type: Number, enum: [1, 2], default: 1 }, // 1 = Bungkus, 2 = Makan di tempat
  id_table_cust: {
    type: Schema.Types.ObjectId,
    ref: "table_cust",
    required: true,
  },
  keterangan: { type: String, required: true },
  total_price: { type: Number, required: true },
  total_quantity: { type: Number, required: true },
  id_user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },
  created_at: { type: Date, default: Date.now },
  orderDetails: [orderDetailSchema],
});

export const OrderModels = model("order", orderSchema, "order");
