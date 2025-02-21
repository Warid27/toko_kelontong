import { Schema, model } from "mongoose";
import { fileMetadataModels } from "@models/fileMetadata-models"; // Import the fileMetadata model

const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: {
    type: Number,
    enum: [0, 1, 2], // (Active, Inactive, Bankrupt)
    default: 1,
  },
  icon: {
    type: String,
    required: true,
    default: "https://placehold.co/500x500",
  },
  banner: {
    type: String,
    required: true,
    default: "https://placehold.co/1440x360",
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

// Virtual field for resolving the icon URL dynamically
storeSchema.virtual("resolvedIcon").get(async function () {
  const shortKey = this.icon;
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
    console.error("Error resolving icon:", error);
    return "https://placehold.co/500x500"; // Fallback image
  }
});

// Virtual field for resolving the banner URL dynamically
storeSchema.virtual("resolvedBanner").get(async function () {
  const shortKey = this.banner;
  if (!shortKey) {
    return "https://placehold.co/1440x360"; // Fallback image
  }
  try {
    // Look up the file metadata using the shortKey
    const fileMetadata = await fileMetadataModels.findOne({
      shortkey: shortKey,
    });
    if (!fileMetadata) {
      return "https://placehold.co/1440x360"; // Fallback image
    }
    // Return the fileUrl
    return fileMetadata.fileUrl;
  } catch (error) {
    console.error("Error resolving banner:", error);
    return "https://placehold.co/1440x360"; // Fallback image
  }
});

export const StoreModels = model("store", storeSchema, "store");
