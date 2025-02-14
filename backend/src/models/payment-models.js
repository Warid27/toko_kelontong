import { Schema, model } from "mongoose";

const paymentNameSchema = new Schema({
  image: {
    type: String,
    required: true,
  },
  payment_name: { type: String, required: true },
  payment_desc: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const paymentTypeSchema = new Schema({
  payment_method: { type: String, required: true },
  keterangan: { type: String, default: null },
  paymentName: [paymentNameSchema],
});

export const PaymentModels = model("payment", paymentTypeSchema, "payment");

