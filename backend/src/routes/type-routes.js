import { Hono } from "hono";
import { PORT } from "@config/config";
import { TypeModels } from "@models/type-models";
import { authenticate } from "@middleware/authMiddleware";
const router = new Hono();

// Add Type
router.post("/addtype", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const tipe = new TypeModels(body);
    await tipe.save();
    return c.json(tipe, 201);
  } catch (error) {
    return c.json({ message: error.message }, 400);
  }
});

// Get All Type
router.post("/listtype", authenticate, async (c) => {
  try {
    const type = await TypeModels.find();
    return c.json(type, 200);
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

// Get Type by ID
router.post("/gettype", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id;

    const type = await TypeModels.findById(id);
    if (!type) {
      return c.json({ error: "Type not found" }, 404);
    }

    return c.json(type, 200);
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

export default router;
