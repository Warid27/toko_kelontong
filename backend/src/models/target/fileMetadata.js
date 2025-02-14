import { Schema, model } from "mongoose";

const fileMetadataSchema = new Schema({
  bucketName: { type: String, required: true },
  objectName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  id_user: { type: Number, required: true },
  shortenedUrl: { type: String, default: null },
  shortkey: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const fileMetadataModels = model(
  "fileMetadata",
  fileMetadataSchema,
  "fileMetadata"
);
