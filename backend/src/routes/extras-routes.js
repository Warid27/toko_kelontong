import { Hono } from "hono";
import { ExtrasModels } from "@models/extras-models";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Helper function to handle errors
const handleError = (c, message, error, status) => {
  console.error(message, error);
  return c.json({ error: message, details: error.message }, status);
};

// Get all extras or by id_store
router.post(
  "/listextras",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.READ),
  async (c) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { id_store } = body;
      console.log("BOD BOD", body);
      if (id_store) {
        if (typeof id_store !== "string") {
          return c.json({ error: "id_store must be a string" }, 400);
        }
        return c.json(await ExtrasModels.find({ id_store }), 200);
      }

      return c.json(await ExtrasModels.find(), 200);
    } catch (error) {
      return handleError(c, "Error fetching extras", error, 500);
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
      if (!id) return c.json({ message: "ID is required" }, 400);

      const extras = await ExtrasModels.findById(id);
      if (!extras) return c.json({ message: "Extras not found" }, 404);

      return c.json(extras, 200);
    } catch (error) {
      return handleError(c, "Error fetching extra", error, 500);
    }
  }
);

// Add extras
router.post(
  "/addextras",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.CREATE),
  async (c) => {
    try {
      const extras = await new ExtrasModels(await c.req.json()).save();
      return c.json(extras, 201);
    } catch (error) {
      return c.json({ error: "Error adding extras" }, 400);
    }
  }
);

export default router;
