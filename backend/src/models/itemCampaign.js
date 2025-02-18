import { Schema, model } from "mongoose";

const itemCampaignSchema = new Schema({
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
  },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
  },
  id_user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  item_campaign_name: { type: String, required: true },
  rules: { type: String, default: null },
  value: { type: Number, default: null },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  status: { type: Number, required: true, default: 2 },
  created_at: { type: Date, default: Date.now },
});

export const itemCampaignModels = model(
  "item_campaign",
  itemCampaignSchema,
  "item_campaign"
);
