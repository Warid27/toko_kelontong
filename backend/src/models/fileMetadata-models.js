import { Schema, model } from "mongoose";

const fileMetadataSchema = new Schema({
  bucketName: { type: String, required: true },
  objectName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  id_user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    default: null,
  },
  shortenedUrl: { type: String, default: null },
  shortkey: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const fileMetadataModels = model(
  "file_metadata",
  fileMetadataSchema,
  "file_metadata"
);
