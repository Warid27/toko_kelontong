import { Schema, model } from "mongoose";
import { resolveImage } from "@utils/imageResolver"; // Import the utility function

const productSchema = new Schema({
  name_product: { type: String, required: true },
  id_category_product: {
    type: Schema.Types.ObjectId,
    ref: "CategoryProduct",
    required: true || 0,
  },
  sell_price: { type: Number, required: true },
  image: { type: String, default: "https://placehold.co/500x500" },
  buy_price: { type: Number, required: true },
  product_code: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  deskripsi: { type: String, required: true },
  status: { type: Number, enum: [0, 1], default: 1 }, // (Active, Inactive)
  id_store: { type: Schema.Types.ObjectId, ref: "store", required: true },
  id_item_campaign: { type: Schema.Types.ObjectId, ref: "item_campaign" },
  id_company: { type: Schema.Types.ObjectId, ref: "company", required: true },
  id_stock: { type: Schema.Types.ObjectId, ref: "stock" },
  id_extras: { type: Schema.Types.ObjectId, ref: "extras" },
  id_size: { type: Schema.Types.ObjectId, ref: "size" },
  created_at: { type: Date, default: Date.now },
});

// Virtual field for resolving the image URL dynamically
productSchema.virtual("resolvedImage").get(async function () {
  return await resolveImage(this.image);
});

// Enable virtuals for JSON and Object transformations
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export const ProductModels = model("product", productSchema, "product");
