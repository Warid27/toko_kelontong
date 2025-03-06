import { Schema, model } from "mongoose";
import { resolveImage } from "@utils/imageResolver"; // Import the utility function

// Define the decorationDetails schema
const decorationDetailsSchema = new Schema({
  primary: { type: String, default: "#24d164" },
  secondary: { type: String, default: "#3b82f6" },
  tertiary: { type: String, default: "#6b7280" },
  danger: { type: String, default: "#ef4444" },
  motive: {
    type: String,
    default: "http://localhost:8080/uploads/store/motive/default-motive.png",
  },
  footer_motive: {
    type: String,
    default:
      "http://localhost:8080/uploads/store/motive/default-footer-motive.png",
  },
  created_at: { type: Date, default: Date.now },
});

// Virtuals for resolving decoration motive images
decorationDetailsSchema.virtual("resolvedMotive").get(async function () {
  return await resolveImage(this.motive);
});
decorationDetailsSchema.virtual("resolvedFooterMotive").get(async function () {
  return await resolveImage(this.footer_motive);
});

// Enable virtuals for decorationDetailsSchema
decorationDetailsSchema.set("toJSON", { virtuals: true });
decorationDetailsSchema.set("toObject", { virtuals: true });

// Define the store schema
const storeSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: Number, enum: [0, 1, 2], default: 1 },
  icon: { type: String, default: "https://placehold.co/500x500" },
  banner: { type: String, default: "https://placehold.co/500x500" },
  id_company: { type: Schema.Types.ObjectId, ref: "company", required: true },
  decorationDetails: { type: decorationDetailsSchema, default: {} },
  created_at: { type: Date, default: Date.now },
});

// Virtual fields for resolving store images
storeSchema.virtual("resolvedIcon").get(async function () {
  return await resolveImage(this.icon);
});

storeSchema.virtual("resolvedBanner").get(async function () {
  return await resolveImage(this.banner);
});

// Enable virtuals for storeSchema
storeSchema.set("toJSON", { virtuals: true });
storeSchema.set("toObject", { virtuals: true });

export const StoreModels = model("store", storeSchema, "store");
