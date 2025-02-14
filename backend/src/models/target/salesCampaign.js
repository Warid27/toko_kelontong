import { Schema, model } from "mongoose";

const salesCampaignSchema = new Schema({
  campaign_name: { type: String, required: true },
  rules: { type: String, default: null },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  id_store: { type: Number, required: true },
  id_company: { type: Number, required: true },
  id_user: { type: Number, required: true },
  value: { type: Number, default: null },
  created_at: { type: Date, default: Date.now },
});

export const salesCampaignModels = model(
  "salesCampaign",
  salesCampaignSchema,
  "salesCampaign"
);
