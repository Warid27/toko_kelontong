import { Hono } from "hono";
import { TypeModels } from "@models/type-models";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Add Type and Broadcast Update
router.post(
  "/addtype",
  (c, next) => authenticate(c, next, "type", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const tipe = new TypeModels(body);
      await tipe.save();

      // Fetch updated type list
      const updatedTypes = await TypeModels.find();

      // ✅ Notify all connected clients
      // sendSSEUpdate(updatedTypes);

      return c.json(tipe, 201);
    } catch (error) {
      console.error("❌ Error in /addtype route:", error);
      return c.json({ message: "Bad Request", error: error.message }, 400);
    }
  }
);

// Get All Types
router.post(
  "/listtype",
  (c, next) => authenticate(c, next, "type", OPERATIONS.READ),
  async (c) => {
    try {
      const types = await TypeModels.find();
      return c.json(types, 200);
    } catch (error) {
      console.error("❌ Error in /listtype route:", error);
      return c.json(
        { message: "Internal Server Error", error: error.message },
        500
      );
    }
  }
);
// Get All Types
router.post("/list", async (c) => {
  try {
    const types = await TypeModels.find();
    return c.json(types, 200);
  } catch (error) {
    console.error("❌ Error in /listtype route:", error);
    return c.json(
      { message: "Internal Server Error", error: error.message },
      500
    );
  }
});

// Get Type by ID
router.post(
  "/gettype",
  (c, next) => authenticate(c, next, "type", OPERATIONS.READ),
  async (c) => {
    try {
      const body = await c.req.json();
      const id = body.id;

      if (!id) {
        return c.json({ error: "ID is required" }, 400);
      }

      const type = await TypeModels.findById(id);
      if (!type) {
        return c.json({ error: "Type not found" }, 404);
      }

      return c.json(type, 200);
    } catch (error) {
      console.error("❌ Error in /gettype route:", error);
      return c.json(
        { message: "Internal Server Error", error: error.message },
        500
      );
    }
  }
);

export default router;
