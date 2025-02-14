import { Schema, model } from "mongoose";

const orderCustSchema = new Schema({
  no: { type: Number, required: true },
  code: { type: String, required: true },
  person_name: { type: String, required: true },
  status: { type: Number, required: true },
  id_table_cust: { type: Number, required: true },
  keterangan: { type: Number, required: true },
  total_price: { type: Number, required: true },
  id_store: { type: Number, required: true },
  id_company: { type: Number, required: true },
  id_user: { type: Number, required: true },
  total_quantity: { type: Number, required: true },
  total_discount: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export const orderCustModels = model("orderCust", orderCustSchema, "orderCust");
