import { Schema, model } from "mongoose";
import { resolveImage } from "@utils/imageResolver";

const CompanySchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  id_type: { type: Schema.Types.ObjectId, ref: "type", required: true },
  status: { type: Number, enum: [0, 1, 2], default: 1 }, // (Active, Inactive, Bankrupt)
  phone: { type: String, required: true },
  email: { type: String, required: true },
  header: { type: String, default: "https://placehold.co/500x500" },
  logo: { type: String, default: "https://placehold.co/500x500" },
  created_at: { type: Date, default: Date.now },
});

// Virtual fields for resolved header and logo URLs
CompanySchema.virtual("resolvedHeader").get(async function () {
  return await resolveImage(this.header);
});

CompanySchema.virtual("resolvedLogo").get(async function () {
  return await resolveImage(this.logo);
});

// Enable virtuals for JSON and Object transformations
CompanySchema.set("toJSON", { virtuals: true });
CompanySchema.set("toObject", { virtuals: true });

export const CompanyModels = model("company", CompanySchema, "company");
