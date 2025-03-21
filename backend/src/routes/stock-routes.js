import { Hono } from "hono";
import { StockModels } from "@models/stock-models";
import { ProductModels } from "@models/product-models";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";
import { mongoose } from "mongoose";
export const router = new Hono();

// Add Stock
router.post(
  "/addstock",
  (c, next) => authenticate(c, next, "stock", OPERATIONS.CREATE),
  async (c) => {
    try {
      const stok = new StockModels(c.body);
      await stok.save();
      return c.json(stok, { status: 201 });
    } catch (error) {
      console.error("Error saving stock:", error);
      return c.json({ error: "Something went wrong" }, { status: 500 });
    }
  }
);

// Get all stock
// router.post("/liststock", authenticate, async (c) => {
//   try {
//     // Fetch stock data and populate the 'id_product' field
//     const stock = await StockModels.find().populate("id_product");
//     return c.json(stock, 200);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     return c.json(
//       { error: "Internal Server Error", details: error.message },
//       500
//     );
//   }
// });

// Get all stock
router.post("/liststock", authenticate, async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    // Jika body kosong, ambil semua stock
    if (!body || Object.keys(body).length === 0) {
      const stock = await StockModels.find().populate("id_product");
      return c.json(stock, 200);
    }

    const query = {};
    if (body.id_store) {
      if (typeof body.id_store !== "string") {
        return c.json({ error: "id_store must be a string" }, 400);
      }
      query.id_store = body.id_store;
    }

    // Ambil produk sesuai query
    const product = await ProductModels.find(query);

    const stocks = [];
    for (const prod of product) {
      const productIDObj = new mongoose.Types.ObjectId(prod._id);
      const stockData = await StockModels.find({
        id_product: productIDObj,
      }).populate("id_product");
      stocks.push(...stockData);
    }

    return c.json(stocks, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});

// Get Stock by Product ID
router.post("/getstock", authenticate, async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    const query = {};
    if (body.id_product) {
      if (typeof body.id_product !== "string") {
        return c.json({ error: "id_product must be a string" }, 400);
      }
      query.id_product = body.id_product;
    }

    // Ambil stock sesuai query
    const stock = await StockModels.find(query).populate("id_product");

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
