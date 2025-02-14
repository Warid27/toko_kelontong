import { Hono } from "hono";
import { SizeModels } from "@models/size-models";
import { mongoose } from "mongoose";

const router = new Hono();

// Get all sizes
router.get("/listsize", async (c) => {
  try {
    // Fetch all companies from the database
    const size = await SizeModels.find();
    return c.json(size, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});
  
  // Get size by ID
  router.post("/getsize", async (c) => {
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
      return c.json({ message: "Terjadi kesalahan saat mengambil size.", error: error.message }, 500);
    }
  });
  
  // Add size
  router.post("/addsize", async (c) => {
    try {
      const body = await c.req.json();
  
      const size = new SizeModels(body);
      await size.save();
  
      return c.json(size, 201);
    } catch (error) {
      return c.text("Terjadi kesalahan saat menambahkan size.", 400);
    }
  });
  
  // Edit size
  router.patch("/editsize", async (c) => {
    try {
      const body = await c.req.json();
      const id = body.id;
  
      if (!id) {
        return c.json({ message: "ID size diperlukan." }, 400);
      }
  
      const size = await SizeModels.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });
  
      if (!size) {
        return c.json({ message: "Size tidak ditemukan." }, 404);
      }
  
      return c.json(size, 200);
    } catch (error) {
      return c.json({ message: "Terjadi kesalahan saat mengedit size.", error: error.message }, 400);
    }
  });
  
  // Delete size
  router.delete("/delete-size/:id", async (c) => {
    try {
      const id = c.req.param("id");
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return c.json({ error: "Invalid size ID format" }, 400);
      }
  
      const size = await SizeModels.deleteOne({ _id: id });
  
      if (!size.deletedCount) {
        return c.json({ error: "Size not found" }, 404);
      }
  
      return c.json({ message: "Size deleted successfully" }, 200);
    } catch (error) {
      return c.json({ error: error.message }, 500);
    }
  });

  
  
  export default router;
  