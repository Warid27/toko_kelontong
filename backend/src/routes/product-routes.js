import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { ProductModels } from "@models/product-models";
import { SizeModels } from "@models/size-models";
import { ExtrasModels } from "@models/extras-models";
import { ObjectId, mongoose } from "mongoose";
import fs from "fs/promises";
import path from "path";
import { StockModels } from "@models/stock-models";

// Middleware
import { authenticate } from "@middleware/authMiddleware"; // Import the middleware

export const router = new Hono();

// Get all product
router.post("/listproduct", async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }

    // Jika body kosong, ambil semua produk
    if (!body || Object.keys(body).length === 0) {
      const products = await ProductModels.find()
        .populate("id_extras")
        .populate("id_size");
      return c.json(products, 200);
    }

    const query = {};
    if (body.id_store) {
      if (typeof body.id_store !== "string") {
        return c.json({ error: "id_store must be a string" }, 400);
      }
      query.id_store = body.id_store;
    }
    if (body.id_company) query.id_company = body.id_company;
    if (body.id_category_product)
      query.id_category_product = body.id_category_product;

    // Ambil produk sesuai query
    const products = await ProductModels.find(query)
      .populate("id_extras")
      .populate("id_size");

    return c.json(products, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});

// Get Company by ID
router.post("/getproduct", async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID perusahaan diperlukan." }, 400);
    }

    const product = await ProductModels.findById(id)
      .populate("id_extras")
      .populate("id_size");

    if (!product) {
      return c.json({ message: "Perusahaan tidak ditemukan." }, 404);
    }

    return c.json(product, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil product.",
        error: error.message,
      },
      500
    );
  }
});

// Add Product
router.post("/addproduct", authenticate, async (c) => {
  try {
    const body = await c.req.json(); // Expect JSON data

    // Validate required fields
    const {
      name_product,
      sell_price,
      buy_price,
      product_code,
      barcode,
      deskripsi,
      id_store,
      id_company,
      id_extras,
      id_size,
      id_category_product,
      image,
    } = body;

    // Check if required fields are present
    if (
      !name_product ||
      !sell_price ||
      !buy_price ||
      !id_category_product ||
      !id_store ||
      !id_company
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Set default image URL if not provided
    let productImage = image || "https://placehold.co/500x500";

    // Save product data to the database
    const data = {
      name_product,
      id_category_product,
      sell_price,
      buy_price,
      product_code,
      barcode,
      deskripsi,
      id_store,
      id_company,
      id_extras,
      id_size,
      image: productImage, // Use the default image if none was provided
    };

    const product = new ProductModels(data);
    const productData = await product.save();

    // Prepare the new extras data
    const stockData = {
      id_product: productData._id,
      amount: 0,
    };

    const stok = new StockModels(stockData);
    const savedStock = await stok.save();
    if (savedStock) {
      await ProductModels.findByIdAndUpdate(
        productData._id,
        { id_stock: savedStock._id },
        { new: true, runValidators: true }
      );
    }
    return c.json({ success: true, savedStock }, 201);
  } catch (error) {
    console.error("Error adding product:", error);
    return c.json(
      { error: "Failed to add product", details: error.message },
      500
    );
  }
});

export default router;
