import { Schema, model } from "mongoose";

const companySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, default: null },
  id_type: { type: Number, default: null },
  status: { type: Number, default: null },
});

export const CompanyModels = model("company", companySchema, "company");
