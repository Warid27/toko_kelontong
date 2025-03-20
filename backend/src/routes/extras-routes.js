import { Hono } from "hono";
import { ExtrasModels } from "@models/extras-models";

// Middleware
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Get all extras

router.post(
  "/listextras",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.READ),
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
        const data = await ExtrasModels.find();
        return c.json(data, 200);
      }

      // Check if id_store exists in the body
      const { id_store } = body;

      if (id_store) {
        // Validate id_store
        if (typeof id_store !== "string") {
          return c.json({ error: "id_store must be a string" }, 400);
        }

        // Fetch data by id_store
        const data = await ExtrasModels.find({ id_store });
        return c.json(data, 200);
      }

      // If id_store does not exist, fetch all data
      const data = await ExtrasModels.find();
      return c.json(data, 200);
    } catch (error) {
      console.error("Error fetching extrases:", error);
      return c.json(
        { error: "Internal Server Error", details: error.message },
        500
      );
    }
  }
);

// Get extras by ID
router.post(
  "/getextras",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID extras diperlukan." }, 400);
      }

      const extras = await ExtrasModels.findById(id);

      if (!extras) {
        return c.json({ message: "Extras tidak ditemukan." }, 404);
      }

      return c.json(extras, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil extras.",
          error: error.message,
        },
        500
      );
    }
  }
);

// Add extras
router.post(
  "/addextras",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const extras = new ExtrasModels(body);
      await extras.save();

      return c.json(extras, 201);
    } catch (error) {
      return c.text("Terjadi kesalahan saat menambahkan extras.", 400);
    }
  }
);

export default router;
