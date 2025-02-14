import { Schema, model } from "mongoose";

const paymentTypeSchema = new Schema({
  payment_method: { type: String, required: true },
  keterangan: { type: String, default: null },
});

export const paymentTypeModels = model(
  "paymentType",
  paymentTypeSchema,
  "paymentType"
);
