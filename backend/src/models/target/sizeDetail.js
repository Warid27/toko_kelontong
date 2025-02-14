import { Schema, model } from "mongoose";

const sizeDetailSchema = new Schema({
  id_size: { type: Number, required: true },
  name: { type: String, required: true },
  deskripsi: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  id_extras: { type: Number, default: 0 },
});

export const sizeDetailModels = model(
  "sizeDetail",
  sizeDetailSchema,
  "sizeDetail"
);
