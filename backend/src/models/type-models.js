import { Schema, model } from "mongoose";

const typeSchema = new Schema({
  type: { type: String, required: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const TypeModels = model("type", typeSchema, "type");
