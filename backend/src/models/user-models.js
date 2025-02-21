import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rule: {
    type: Number,
    enum: [1, 2, 3, 4], // (Superadmin, Admin, Manajer, Kasir)
    default: 0,
  },
  status: {
    type: Number,
    enum: [0, 1], // (Active, Inactive)
    default: 1,
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
  },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const UserModels = new model("users", userSchema, "users");
