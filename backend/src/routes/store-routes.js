import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { StoreModels } from "@models/store-models";
import { mongoose } from "mongoose";
import fs from "fs/promises";
import path from "path";

const router = new Hono();

// Store

// Add Store
router.post("/addstore", async (c) => {
  try {
    let body;
    let name;
    let address;
    let status;
    let id_company;

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
    } else {
      // If the body is URL-encoded, use URLSearchParams to parse it
      const rawBody = await c.req.text();
      body = new URLSearchParams(rawBody);
      name = body.get("name");
      address = body.get("address");
      id_company = body.get("id_company");
      status = body.get("status");
    }

    // Construct a new object with the required fields
    const storeData = {
      name,
      address,
      id_company,
      status,
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

router.post("/liststore", async (c) => {
  try {
    // Fetch all stores from the database
    const stores = await StoreModels.find().lean(); // Use `.lean()` for better performance

    // Check if any stores exist
    if (!stores || stores.length === 0) {
      return c.json({ message: "No stores found" }, 404);
    }

    // Return the list of stores
    return c.json(stores, 200);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

// Edit Store
router.post("/editstore", async (c) => {
  try {
    let body;
    let id;
    let name;
    let address;
    let status;
    let id_company;

    // Check if the request is for JSON data
    if (
      c.req.header("accept") === "application/json" ||
      c.req.header("Content-Type") === "application/json"
    ) {
      // Parse JSON body
      body = await c.req.json();
      id = body.id;
      name = body.name;
      address = body.address;
      id_company = body.id_company; // Fixed typo (was id_type before)
      status = body.status;
    } else {
      // If the body is URL-encoded, use URLSearchParams to parse it
      const rawBody = await c.req.text();
      body = new URLSearchParams(rawBody);
      id = body.get("id");
      name = body.get("name");
      address = body.get("address");
      id_company = body.get("id_company");
      status = body.get("status");
    }

    // Construct a new object with the required fields
    const storeData = {
      id,
      name,
      address,
      id_company,
      status,
    };

    // Validate all required fields
    if (!id === undefined) {
      throw new Error("Validation error: id are required.");
    }

    const store = await StoreModels.findByIdAndUpdate(id, storeData, {
      new: true,
      runValidators: true,
    });

    if (!store) {
      return c.text("Store not found", 404);
    }

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

// Delete store
router.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid store ID format" }, 400);
    }

    const ds = await StoreModels.deleteOne({ _id: id });

    if (!ds.deletedCount) {
      return c.json({ error: "Store not found" }, 404);
    }

    return c.json(ds, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

router.post("/getstore", async (c) => {
  try {
    const { id } = await c.req.json();

    console.log("ID:", id);
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

// Upload

router.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "Image is required" }, 400);
    }

    // Save the file to the server
    const uploadsDir = path.join(process.cwd(), "uploads/store/icon");
    await fs.mkdir(uploadsDir, { recursive: true });
    const ext = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileBuffer = await file.arrayBuffer();

    const imageUrl = `http://localhost:8080/uploads/store/icon/${fileName}`;

    await fs.writeFile(filePath, Buffer.from(fileBuffer));
    return c.json({ success: true, image: imageUrl }, 201);
  } catch (error) {
    console.error("Error uploading image:", error);
    return c.json(
      { error: "Failed to upload image", details: error.message },
      500
    );
  }
});
export default router;
