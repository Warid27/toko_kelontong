import { Hono } from "hono";
import { SizeModels } from "@models/size-models";
import { mongoose } from "mongoose";

import { authenticate } from "@middleware/authMiddleware";

const router = new Hono();

// Get all sizes
router.post("/listsize", authenticate, async (c) => {
  try {
    // Fetch all companies from the database
    const size = await SizeModels.find();
    return c.json(size, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get size by ID
router.post("/getsize", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID size diperlukan." }, 400);
    }

    const size = await SizeModels.findById(id);

    if (!size) {
      return c.json({ message: "Size tidak ditemukan." }, 404);
    }

    return c.json(size, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil size.",
        error: error.message,
      },
      500
    );
  }
});

// Add size
router.post("/addsize", authenticate, async (c) => {
  try {
    const body = await c.req.json();

    const size = new SizeModels(body);
    await size.save();

    return c.json(size, 201);
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan size.", 400);
  }
});

export default router;
