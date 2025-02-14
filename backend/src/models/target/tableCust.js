import { Schema, model } from "mongoose";

const tableCustSchema = new Schema({
  name: { type: String, required: true },
  no: { type: Number, required: true },
  create_at: { type: Date, default: Date.now },
});

export const tableCustModels = model("tableCust", tableCustSchema, "tableCust");
