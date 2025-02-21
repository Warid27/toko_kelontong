import { Hono } from "hono";
import { CategoryProductModels } from "@models/categoryProduct-models"; // Adjust the import path as needed
import { mongoose } from "mongoose";

// Middleware
import { authenticate } from "@middleware/authMiddleware"; // Import the middleware

const router = new Hono();

// Get all categories
router.post("/listcategories", async (c) => {
  try {
    // Parse the request body
    let body;
    try {
      body = await c.req.json(); // Attempt to parse the JSON body
    } catch (parseError) {
      return c.json({ error: "Invalid JSON payload" }, 400); // Handle invalid JSON
    }

    // Check if the body is empty
    if (!body || Object.keys(body).length === 0) {
      // If the body is empty, fetch all data
      const data = await CategoryProductModels.find();
      return c.json(data, 200);
    }

    // Check if name_category exists in the body
    const { name_category } = body;
    if (name_category) {
      // Validate name_category
      if (typeof name_category !== "string") {
        return c.json({ error: "name_category must be a string" }, 400);
      }
      // Fetch data by name_category
      const data = await CategoryProductModels.find({ name_category });
      return c.json(data, 200);
    }

    // If name_category does not exist, fetch all data
    const data = await CategoryProductModels.find();
    return c.json(data, 200);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});

// Get category by ID
router.post("/getcategory", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();
    if (!id) {
      return c.json({ message: "ID category diperlukan." }, 400);
    }
    const category = await CategoryProductModels.findById(id);
    if (!category) {
      return c.json({ message: "Category tidak ditemukan." }, 404);
    }
    return c.json(category, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil category.",
        error: error.message,
      },
      500
    );
  }
});

// Add category
router.post("/addcategory", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const category = new CategoryProductModels(body);
    await category.save();
    return c.json(category, 201);
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan category.", 400);
  }
});

export default router;
