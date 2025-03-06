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
const BUN_ENV = Bun.env.BUN_ENV || "local";
const PORT = Bun.env.PORT || 3000;
const HOST_NAME = Bun.env.HOST_NAME;
const BACKEND_URI = `http://${HOST_NAME}:${PORT}`;

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
  .then(() => console.log(`Database Connected Successfully [${BUN_ENV}]`))
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
async function ensureBucketExistsAndSetPolicy() {
  try {
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(MINIO_BUCKET_NAME, MINIO_REGION);
      console.log(`Bucket "${MINIO_BUCKET_NAME}" created successfully.`);
    } else {
      console.log(`Bucket "${MINIO_BUCKET_NAME}" already exists.`);
    }

    // Define a public read-only policy
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
        },
      ],
    };

    // Convert policy to JSON string
    const policyString = JSON.stringify(policy);

    // Apply the policy to the bucket
    await minioClient.setBucketPolicy(MINIO_BUCKET_NAME, policyString);
    console.log(`Public policy set for bucket "${MINIO_BUCKET_NAME}".`);
  } catch (error) {
    console.error("Error checking/creating bucket or setting policy:", error);
  }
}

// Run the function when the app starts
ensureBucketExistsAndSetPolicy();

const protocol = MINIO_USE_SSL === true ? "https" : "http";
const minioUrl = `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET_NAME}`;

export {
  PORT,
  SECRET_KEY,
  JWT_SECRET,
  renderEJS,
  minioClient,
  MINIO_BUCKET_NAME,
  minioUrl,
  BACKEND_URI,
  HOST_NAME,
};
