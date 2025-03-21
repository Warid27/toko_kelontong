import { Hono } from "hono";
import { tableCustModels } from "@models/table_cust-models";

import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Add Table Customer
router.post(
  "/addtable",
  (c, next) => authenticate(c, next, "table_cust", OPERATIONS.READ),
  async (c) => {
    try {
      const body = await c.req.json();
      const table = new tableCustModels(body);
      await table.save();
      return c.json(table, 201);
    } catch (error) {
      return c.json({ message: error.message }, 400);
    }
  }
);

// Get All Tables
router.post(
  "/listtable",
  (c, next) => authenticate(c, next, "table_cust", OPERATIONS.READ),
  async (c) => {
    try {
      const tables = await tableCustModels.find();
      return c.json(tables, 200);
    } catch (error) {
      return c.json({ message: error.message }, 500);
    }
  }
);

// Get Table by ID
router.post(
  "/gettable",
  (c, next) => authenticate(c, next, "table_cust", OPERATIONS.READ),
  async (c) => {
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
  }
);

export default router;
