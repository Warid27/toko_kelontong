import { Hono } from "hono";
import { Client } from "minio";
import mongoose from "mongoose";

// Load environment variables using Bun's built-in support
// NotUse (Will be deleted)
const renderEJS = "";

// JWT
const SECRET_KEY = Bun.env.JWT_SECRET;
const JWT_SECRET = Bun.env.JWT_SECRET;

// PORT
const PORT = Bun.env.PORT || 3000;

// MongoDB
const MONGO_URI = Bun.env.MONGO_URI || "";

// MinIO
const MINIO_ENDPOINT = Bun.env.MINIO_ENDPOINT || "";
const MINIO_PORT = parseInt(Bun.env.MINIO_PORT || "443", 10);
const MINIO_USE_SSL = Bun.env.MINIO_USE_SSL === "true";
const MINIO_ACCESS_KEY = Bun.env.MINIO_ACCESS_KEY || "";
const MINIO_SECRET_KEY = Bun.env.MINIO_SECRET_KEY || "";
const MINIO_BUCKET_NAME = Bun.env.MINIO_BUCKET_NAME || "";
const MINIO_REGION = Bun.env.MINIO_REGION || "";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.error("Database cannot be Connected", err));

// MiniO
const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
  region: MINIO_REGION,
});

// Ensure the bucket exists

try {
  const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(MINIO_BUCKET_NAME, MINIO_REGION);
    console.log(`Bucket "${MINIO_BUCKET_NAME}" created successfully.`);
  } else {
    console.log(`Bucket "${MINIO_BUCKET_NAME}" already exists.`);
  }
} catch (error) {
  console.error("Error checking/creating bucket:", error);
}
const protocol = MINIO_USE_SSL === "true" ? "https" : "http";
const minioUrl = `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET_NAME}`;

export {
  PORT,
  SECRET_KEY,
  JWT_SECRET,
  renderEJS,
  minioClient,
  MINIO_BUCKET_NAME,
  minioUrl,
};
