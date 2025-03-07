import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { StoreModels } from "@models/store-models";
import { mongoose } from "mongoose";
import { authenticate } from "@middleware/authMiddleware";
import fs from "fs/promises";
import path from "path";

const router = new Hono();

// Store

// Add Store
router.post("/addstore", authenticate, async (c) => {
  try {
    let body;
    let name;
    let address;
    let status;
    let id_company;
    let icon;

    // Check if the request is for JSON data
    if (
      c.req.header("accept") === "application/json" ||
      c.req.header("Content-Type") === "application/json"
    ) {
      // Parse JSON body
      body = await c.req.json();
      name = body.name;
      address = body.address;
      id_company = body.id_company; // Fixed typo (was id_type before)
      status = body.status;
      icon = body.icon;
    } else {
      // If the body is URL-encoded, use URLSearchParams to parse it
      const rawBody = await c.req.text();
      body = new URLSearchParams(rawBody);
      name = body.get("name");
      address = body.get("address");
      id_company = body.get("id_company");
      status = body.get("status");
      icon = body.get("icon");
    }

    // Construct a new object with the required fields
    const storeData = {
      name,
      address,
      id_company,
      status,
      icon,
    };

    // Validate all required fields
    if (!name || !address || !id_company || status === undefined) {
      throw new Error(
        "Validation error: name, address, id_company, and status are required."
      );
    }

    // Create a new store object with the parsed data
    const store = new StoreModels(storeData);
    await store.save();

    if (
      c.req.header("content-type") === "application/json" ||
      c.req.header("accept") === "application/json"
    ) {
      return c.json(store);
    } else {
      return c.redirect("/store");
    }
  } catch (error) {
    return c.text(error.message, 400);
  }
});

// Get all store

router.post("/liststore", authenticate, async (c) => {
  try {
    const body = await c.req.json();

    let { id_company } = body;

    // Validasi id_company agar tidak berisi string "undefined" atau null
    if (!id_company || id_company === "undefined" || id_company === "null") {
      id_company = null;
    }

    let stores;
    if (id_company) {
      // Pastikan `id_company` valid sebelum dipakai dalam query
      if (!mongoose.Types.ObjectId.isValid(id_company)) {
        return c.json({ error: "Invalid id_company format" }, 400);
      }
      stores = await StoreModels.find({ id_company })
        .populate("decorationDetails")
        .lean();
    } else {
      stores = await StoreModels.find().populate("decorationDetails").lean();
    }
    return c.json(stores, 200);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});
router.post("/getstore", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID Store diperlukan." }, 400);
    }

    const store = await StoreModels.findById(id);

    if (!store) {
      return c.json({ message: "Store tidak ditemukan." }, 404);
    }

    return c.json(store, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil Store.",
        error: error.message,
      },
      500
    );
  }
});
router.post("/getStoreImage", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id;
    const params = body.params;
    if (!id) {
      return c.json({ message: "ID Store diperlukan." }, 400);
    }

    const store = await StoreModels.findById(id);

    if (!store) {
      return c.json({ message: "Store tidak ditemukan." }, 404);
    }
    let result;
    if (params == "icon") {
      result = store.icon;
    } else if (params == "banner") {
      result = store.banner;
    } else {
      return c.json({ message: "Params tidak ditemukan." }, 400);
    }
    return c.json(result, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil Store.",
        error: error.message,
      },
      500
    );
  }
});
export default router;
