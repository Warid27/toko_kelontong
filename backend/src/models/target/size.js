import { Schema, model } from "mongoose";

const sizeSchema = new Schema({
  id_product: { type: Number, required: true },
  name: { type: String, required: true },
  deskripsi: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

export const sizeModels = model("size", sizeSchema, "size");
