import { Schema, model } from "mongoose";

const extrasSchema = new Schema({
  id_product: { type: Number, required: true },
  name: { type: String, required: true },
  deskripsi: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
});

export const ExtrasModels = model("extras", extrasSchema, "extras");
