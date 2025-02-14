import { Schema, model } from "mongoose";

const extrasDetailSchema = new Schema({
  id_extras: {
    type: Schema.Types.ObjectId,
    ref: "extras",
  },
  name: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const extrasSchema = new Schema({
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  extrasDetails: [extrasDetailSchema],
});

export const ExtrasModels = model("extras", extrasSchema, "extras");
