import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rule: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // (Superadmin, Admin, Manajer, Kasir, Customer)
    default: 0,
  },
  status: {
    type: Number,
    enum: [0, 1], // (Active, Inactive)
    default: 1,
  },
  id_company: {
    type: Schema.Types.ObjectId,
    ref: "company",
  },
  id_store: {
    type: Schema.Types.ObjectId,
    ref: "store",
  },
  avatar: {
    type: String,
    default: "https://placehold.co/500x500",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for resolving the avatar URL dynamically
userSchema.virtual("resolvedAvatar").get(async function () {
  const shortKey = this.avatar;
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
    console.error("Error resolving avatar:", error);
    return "https://placehold.co/1440x360"; // Fallback image
  }
});

export const UserModels = new model("users", userSchema, "users");
