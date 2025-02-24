import { Schema, model } from "mongoose";
import { fileMetadataModels } from "@models/fileMetadata-models"; // Import the fileMetadata model

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
    default: "https://placehold.co/500x500",
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
    enum: [0, 1], // (Active, Inactive)
    default: 1,
  },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
    required: true,
  },
  id_item_campaign: {
    type: Schema.Types.ObjectId,
    ref: "item_campaign",
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  id_stock: {
    type: Schema.Types.ObjectId,
    ref: "stock",
  },
  id_extras: {
    type: Schema.Types.ObjectId,
    ref: "extras",
  },
  id_size: {
    type: Schema.Types.ObjectId,
    ref: "size",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for resolving the image URL dynamically
productSchema.virtual("resolvedImage").get(async function () {
  const shortKey = this.image;

  if (!shortKey) {
    return "https://placehold.co/500x500"; // Fallback image
  }

  try {
    // Look up the file metadata using the shortKey
    const fileMetadata = await fileMetadataModels.findOne({
      shortkey: shortKey,
    });

    if (!fileMetadata) {
      return "https://placehold.co/500x500"; // Fallback image
    }

    // Return the fileUrl
    return fileMetadata.fileUrl;
  } catch (error) {
    console.error("Error resolving image:", error);
    return "https://placehold.co/500x500"; // Fallback image
  }
});

export const ProductModels = model("product", productSchema, "product");
