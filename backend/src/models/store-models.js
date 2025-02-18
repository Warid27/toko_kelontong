import { Schema, model } from "mongoose";

const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: Number, required: true },
  icon: {
    type: String,
    required: true,
    default:
      "https://png.pngtree.com/png-clipart/20230824/original/pngtree-shop-building-icon-picture-image_8324710.png",
  },
  banner: {
    type: String,
    required: true,
    default: "http://localhost:8080/uploads/no_image.jpg",
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

export const StoreModels = model("store", storeSchema, "store");
