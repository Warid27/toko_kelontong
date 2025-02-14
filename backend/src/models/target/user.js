import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  rule: { type: String, required: true},
  id_company: { type: Number, required: true},
  id_store: { type: Number, required: true},
  status: { type: Number, required: true},
  created_at: { type: Date, default: Date.now},
});

export const userModels = model("user", userSchema, "user");
