import { Schema, model } from "mongoose";

const sizeDetailSchema = new Schema({
  name: { type: String, required: true },
  deskripsi: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  id_size: {
    type: Schema.Types.ObjectId,
    ref: "size",
  },
});

const sizeSchema = new Schema({
  id_product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  name: { type: String, required: true },
  deskripsi: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  sizeDetails: [sizeDetailSchema],
});

export const SizeModels = model("size", sizeSchema, "size");
