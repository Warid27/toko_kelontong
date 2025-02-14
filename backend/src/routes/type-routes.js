import { Hono } from "hono";
import { PORT } from "@config/config";
import { TypeModels } from "@models/type-models";

const router = new Hono();

// Add Type
router.post("/addtype", async (c) => {
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
router.get("/listtype", async (c) => {
  try {
    const type = await TypeModels.find();
    return c.json(type, 200);
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

// Get Type by ID
router.post("/gettype", async (c) => {
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

// Delete type
router.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id"); // Get the ID from the URL parameter

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid Type ID format" }, 400);
    }

    // Delete the type based on ID
    const type = await TypeModels.deleteOne({ _id: id });

    if (!type.deletedCount) {
      // No type found to delete
      return c.json({ error: "type not found" }, 404);
    }

    return c.json({ message: "type deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
