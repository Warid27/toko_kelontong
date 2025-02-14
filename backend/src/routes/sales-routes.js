import { Hono } from "hono";
import { SalesModels } from "@models/sales-models";
import { mongoose } from "mongoose";

const router = new Hono();

// Get all sales
router.post("/listsales", async (c) => {
  try {
    const sales = await SalesModels.find();
    return c.json(sales, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get sales by ID
router.post("/getsales", async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID sales diperlukan." }, 400);
    }

    const sales = await SalesModels.findById(id);

    if (!sales) {
      return c.json({ message: "Sales tidak ditemukan." }, 404);
    }

    return c.json(sales, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil sales.",
        error: error.message,
      },
      500
    );
  }
});

// Add sales
router.post("/addsales", async (c) => {
  try {
    const body = await c.req.json();
    const sales = new SalesModels(body);
    await sales.save();
    return c.json(sales, 201);
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan sales.", 400);
  }
});

// Edit sales
router.patch("/editsales", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id;

    if (!id) {
      return c.json({ message: "ID sales diperlukan." }, 400);
    }

    const sales = await SalesModels.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!sales) {
      return c.json({ message: "Sales tidak ditemukan." }, 404);
    }

    return c.json(sales, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengedit sales.",
        error: error.message,
      },
      400
    );
  }
});

// Delete sales
router.delete("/deletesales/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid sales ID format" }, 400);
    }

    const sales = await SalesModels.deleteOne({ _id: id });

    if (!sales.deletedCount) {
      return c.json({ error: "Sales not found" }, 404);
    }

    return c.json({ message: "Sales deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
