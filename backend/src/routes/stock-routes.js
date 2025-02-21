import { Hono } from "hono";
import { PORT } from "@config/config";
import { StockModels } from "@models/stock-models";
import { authenticate } from "@middleware/authMiddleware";
export const router = new Hono();

// Add Stock
router.post("/addstock", authenticate, async (c) => {
  try {
    const stok = new StockModels(c.body);
    await stok.save();
    return c.json(stok, { status: 201 });
  } catch (error) {
    console.error("Error saving stock:", error);
    return c.json({ error: "Something went wrong" }, { status: 500 });
  }
});

// Get all stock
router.post("/liststock", authenticate, async (c) => {
  try {
    // Fetch stock data and populate the 'id_product' field
    const stock = await StockModels.find().populate("id_product");
    return c.json(stock, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});
export default router;
