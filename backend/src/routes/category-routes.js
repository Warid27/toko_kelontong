import { Hono } from "hono";
import { CategoryProductModels } from "@models/categoryProduct-models"; // Adjust the import path as needed

// Middleware
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Get all categories
router.post(
  "/listcategories",
  (c, next) => authenticate(c, next, "category_product", OPERATIONS.READ),
  async (c) => {
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
      const { name_category, id_store } = body;
      if (name_category) {
        // Validate name_category
        if (typeof name_category !== "string") {
          return c.json({ error: "name_category must be a string" }, 400);
        }
        // Fetch data by name_category
        const data = await CategoryProductModels.find({
          name_category,
          id_store,
        });
        return c.json(data, 200);
      }

      // If name_category does not exist, fetch all data
      const data = await CategoryProductModels.find({ id_store });
      return c.json(data, 200);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return c.json(
        { error: "Internal Server Error", details: error.message },
        500
      );
    }
  }
);

// Get category by ID
router.post(
  "/getcategory",
  (c, next) => authenticate(c, next, "category_product", OPERATIONS.READ),
  async (c) => {
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
  }
);

// Get category by name_category
router.post("/name", authenticate, async (c) => {
  try {
    // Extract and validate the request body
    const { id_store, category } = await c.req.json();

    // Validate required fields
    if (!id_store) {
      return c.json({ message: "ID toko diperlukan." }, 400);
    }
    if (!category) {
      return c.json({ message: "Nama kategori diperlukan." }, 400);
    }

    // Trim input values to avoid whitespace issues
    const trimmedCategory = category.trim();
    const trimmedIdStore = id_store.trim();

    // Query the database to find the category by name_category and id_store
    const response = await CategoryProductModels.findOne({
      name_category: { $regex: new RegExp(`^${trimmedCategory}$`, "i") },
      id_store: trimmedIdStore,
    });

    // If no category is found, return a 404 error
    if (!response) {
      return c.json({ message: "Kategori tidak ditemukan." }, 404);
    }

    // Return the found category
    return c.json(response, 200);
  } catch (error) {
    // Handle any unexpected errors
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil kategori.",
        error: error.message,
      },
      500
    );
  }
});

// Add category
router.post(
  "/addcategory",
  (c, next) => authenticate(c, next, "category_product", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const category = new CategoryProductModels(body);
      await category.save();
      return c.json(category, 201);
    } catch (error) {
      return c.text("Terjadi kesalahan saat menambahkan category.", 400);
    }
  }
);

export default router;
