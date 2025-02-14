import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name_product: { type: String, required: true },
  id_category_product: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sell_price: { type: Number, required: true },
  image: { type: String, required: true },
  buy_price: { type: Number, required: true },
  product_code: { type: String, default: null },
  barcode: { type: String, default: null },
  deskripsi: { type: String, default: null },
  status: { type: Number, required: true },
  id_company: { type: Number, required: true },
  id_store: { type: Number, required: true },
  id_item_campaign: { type: Number, required: true },
  id_product: { type: Number, required: true },
  id_size: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export const ProductModels = model("product", productSchema, "product");
