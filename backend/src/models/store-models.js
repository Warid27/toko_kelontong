import { Schema, model } from 'mongoose';

const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: Number, required: true },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

export const StoreModels  = model("store", storeSchema, "store");
