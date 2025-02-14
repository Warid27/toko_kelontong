import { Schema, model } from "mongoose";

const typeSchema = new Schema({
  type: { type: String, required: true },
});

export const typeModels = model("type", typeSchema, "type");
