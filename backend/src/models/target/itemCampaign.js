import { Schema, model } from "mongoose";

const itemCampaignSchema = new Schema({
  id_company: { type: Number, required: true },
  id_store: { type: Number, required: true },
  id_user: { type: Number, required: true },
  item_campaign_name: { type: String, required: true },
  rules: { type: String, default: null },
  value: { type: Number, default: null },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  status: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export const itemCampaignModels = model("itemCampaign", itemCampaignSchema, "itemCampaign");
