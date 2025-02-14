import { Schema, model } from "mongoose";

const extrasDetailSchema = new Schema({
  id_extras: { type: Number, required: true },
  name: { type: String, required: true },
  deskripsi: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

export const extrasDetailModels = model("extrasDetail", extrasDetailSchema, "extrasDetail");
