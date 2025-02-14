import { Schema, model } from "mongoose";

const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: Number, required: true },
  id_company: { type: Number, required: true },
  create_at: { type: Date, default: Date.now },
});

export const storeModels = model("store", storeSchema, "store");
