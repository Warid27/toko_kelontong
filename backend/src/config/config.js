import { Hono } from "hono";
import mongoose from "mongoose";

// Load environment variables using Bun's built-in support
const MONGO_URI = Bun.env.MONGO_URI || "";
const SECRET_KEY = Bun.env.SECRET_KEY || "admin123";
const PORT = Bun.env.PORT || 3000;
const renderEJS = "";

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.error("Database cannot be Connected", err));

export { PORT, SECRET_KEY, renderEJS };
