import { Schema, model } from "mongoose";

const paymentNameSchema = new Schema({
  id_payment_type: { type: Number, required: true },
  payment_name: { type: String, required: true },
  payment_desc: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export const paymentNameModels = model(
  "paymentName",
  paymentNameSchema,
  "paymentName"
);
