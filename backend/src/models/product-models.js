import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name_product: {
    type: String,
    required: true,
  },
  id_category_product: {
    type: Schema.Types.ObjectId,
    ref: "CategoryProduct",
    required: true || 0,
  },
  sell_price: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  buy_price: {
    type: String,
    required: true,
  },
  product_code: {
    type: String,
    required: true,
  },
  barcode: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
    required: true,
  },
  id_item_campaign: {
    type: Schema.Types.ObjectId,
    ref: "itemCampaign",
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  stok: {
    type: Number,
    required: true || 0,
  },
  id_extras: {
    type: Schema.Types.ObjectId,
    ref: "extras",
    // required: true,
  },
  id_size: {
    type: Schema.Types.ObjectId,
    ref: "size",
    // required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const ProductModels = model("product", productSchema, "product");
