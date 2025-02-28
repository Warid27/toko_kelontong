import { Hono } from "hono";
import { TypeModels } from "@models/type-models";
import { authenticate } from "@middleware/authMiddleware";

const router = new Hono();

router.post("/addtype", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const tipe = new TypeModels(body);
    await tipe.save();

    // Fetch updated types
    const updatedTypes = await TypeModels.find();

    // console.log("🔥 Sending WebSocket broadcast...");
    // if (globalThis.broadcast) {
    //   console.log("✅ globalThis.broadcast exists. Broadcasting...");
    //   globalThis.broadcast({ action: "listtype", data: updatedTypes });
    // } else {
    //   console.error("❌ globalThis.broadcast is undefined!");
    // }

    return c.json(tipe, 201);
  } catch (error) {
    console.error("❌ Error in /addtype route:", error);
    return c.json({ message: "Bad Request", error: error.message }, 400);
  }
});

// Get All Types and Broadcast
router.post("/listtype", authenticate, async (c) => {
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
router.post("/gettype", authenticate, async (c) => {
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
});
export default router;
