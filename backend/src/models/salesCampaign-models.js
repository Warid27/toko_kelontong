import { Schema, model } from "mongoose";

const salesCampaignSchema = new Schema({
  campaign_name: { type: String, required: true },
  rules: { type: String, default: null },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  id_store: { type: Schema.Types.ObjectId, ref: "store" },
  id_company: { type: Schema.Types.ObjectId, ref: "company" },
  id_user: { type: Schema.Types.ObjectId, ref: "user" },
  value: { type: Number, default: null },
  created_at: { type: Date, default: Date.now },
});

export const salesCampaignModels = model(
  "salesCampaign",
  salesCampaignSchema,
  "salesCampaign"
);
