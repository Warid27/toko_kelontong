import { Schema, model } from "mongoose";

const orderDetailSchema = new Schema({
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  id_extrasDetails: {
    type: Schema.Types.ObjectId,
    ref: "extras",
    required: true,
  },
  id_sizeDetails: {
    type: Schema.Types.ObjectId,
    ref: "size",
    required: true,
  },
  name_product: { type: String, required: true },
  quantity: { type: Number, required: true },
  price_item: { type: Number, required: true },
  total_price: { type: Number, required: true },
  discount: { type: Number, required: true },
});

const orderSchema = new Schema({
  no: { type: String, required: true },
  code: { type: String, required: true },
  person_name: { type: String, required: true },
  status: { type: Number, required: true },
  id_table_cust: {
    type: Schema.Types.ObjectId,
    ref: "table_cust",
    required: true,
  },
  keterangan: { type: Number, required: true },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
    required: true,
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  id_user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  orderDetails: [orderDetailSchema],
});

export const OrderModels = model("order", orderSchema, "order");
