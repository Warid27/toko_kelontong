import { Hono } from "hono";
import { PORT } from "@config/config";
import { StockModels } from "@models/stock-models";

const router = new Hono();



// Add Stock
router.post("/addstock", async (c) => {
  try {
    const stok = new StockModels(c.body);
    await stok.save();
    return c.json(stok, { status: 201 });
  } catch (error) {
    console.error("Error saving stock:", error);
    return c.json({ error: 'Something went wrong' }, { status: 500 });
  }
});

// Get all stock
router.get("/liststock", async (c) => {
  try {
    // Fetch all companies from the database
    const stock = await StockModels.find();
    return c.json(stock, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

export default router;
