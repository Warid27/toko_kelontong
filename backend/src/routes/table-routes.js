import { Hono } from "hono";
import { tableCustModels } from "@models/table_cust-models";

const router = new Hono();

// Add Table Customer
router.post("/addtable", async (c) => {
  try {
    const body = await c.req.json();
    const table = new tableCustModels(body);
    await table.save();
    return c.json(table, 201);
  } catch (error) {
    return c.json({ message: error.message }, 400);
  }
});

// Get All Tables
router.get("/listtable", async (c) => {
  try {
    const tables = await tableCustModels.find();
    return c.json(tables, 200);
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

// Get Table by ID
router.post("/gettable", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id;

    const table = await tableCustModels.findById(id);
    if (!table) {
      return c.json({ error: "Table not found" }, 404);
    }

    return c.json(table, 200);
  } catch (error) {
    return c.json({ message: error.message }, 500);
  }
});

// Delete Table by ID
router.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return c.json({ error: "Invalid Table ID format" }, 400);
    }

    const table = await tableCustModels.deleteOne({ _id: id });

    if (!table.deletedCount) {
      return c.json({ error: "Table not found" }, 404);
    }

    return c.json({ message: "Table deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
