import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { ProductModels } from "@models/product-models";
import { SizeModels } from "@models/size-models";
import { ExtrasModels } from "@models/extras-models";
import { ObjectId, mongoose } from "mongoose";
import fs from "fs/promises";
import path from "path";

const router = new Hono();

// Get all product
router.post("/listproduct", async (c) => {
  try {
    // Parse the request body
    let body;
    try {
      body = await c.req.json(); // Attempt to parse the JSON body
    } catch (parseError) {
      return c.json({ error: "Invalid JSON payload" }, 400); // Handle invalid JSON
    }

    // Check if the body is empty
    if (!body || Object.keys(body).length === 0) {
      // If the body is empty, fetch all products
      const products = await ProductModels.find()
        .populate("id_extras")
        .populate("id_size");
      return c.json(products, 200);
    }

    // Check if id_store exists in the body
    const { id_store } = body;

    if (id_store) {
      // Validate id_store
      if (typeof id_store !== "string") {
        return c.json({ error: "id_store must be a string" }, 400);
      }

      // Fetch products by id_store
      const products = await ProductModels.find({ id_store });
      return c.json(products, 200);
    }

    // If id_store does not exist, fetch all products
    const products = await ProductModels.find()
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

// Upload Image
router.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "Image is required" }, 400);
    }

    // Save the file to the server
    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const ext = path.extname(file.name);
    const fileName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileBuffer = await file.arrayBuffer();

    const imageUrl = `http://localhost:8080/uploads/users/${fileName}`;

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

// Add Product
router.post("/addproduct", async (c) => {
  try {
    const body = await c.req.json(); // Expect JSON data

    // Validate required fields
    const {
      name_product,
      stock,
      sell_price,
      buy_price,
      product_code,
      barcode,
      deskripsi,
      status,
      id_store,
      id_company,
      id_extras,
      id_size,
      id_category_product,
      image, // Image URL from the /upload route
    } = body;

    if (!image) {
      return c.json({ error: "Image URL is required" }, 400);
    }

    // Save product data to the database
    const data = {
      name_product,
      id_category_product,
      stok: stock,
      sell_price,
      buy_price,
      product_code,
      barcode,
      deskripsi,
      status,
      id_store,
      id_company,
      id_extras,
      id_size,
      image,
    };

    const product = new ProductModels(data);
    await product.save();

    return c.json({ success: true, product }, 201);
  } catch (error) {
    console.error("Error adding product:", error);
    return c.json(
      { error: "Failed to add product", details: error.message },
      500
    );
  }
});

router.get("/sizeproduk/:id", async (c) => {
  try {
    console.log("Fetching product data..."); // Debug log
    const responseProduct = await fetch(
      `http://localhost:${PORT}/product/getproduct`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: c.req.param("id") }), // Pastikan pakai JSON.stringify
      }
    );

    console.log("Fetching size data...");
    const responseSize = await fetch(`http://localhost:${PORT}/size/listsize`);

    // Pastikan response HTTP oke sebelum lanjut
    if (!responseProduct.ok) throw new Error("Failed to fetch product data");
    if (!responseSize.ok) throw new Error("Failed to fetch size data");

    const rawSize = await responseSize.json();
    console.log("Raw size data:", rawSize); // Debug data size

    const dataSize =
      rawSize.find((ds) => ds.id_product == c.req.param("id")) || null;
    console.log("Filtered dataSize:", dataSize);

    const dataProduct = await responseProduct.json();
    console.log("Product data:", dataProduct); // Debug product data

    const html = await renderEJS("size", {
      title: "yuda",
      dataProduct,
      dataSize, // Tetap kirim, tetapi bisa null
      dataDetailSize: dataSize ? dataSize.sizeDetails || [] : [], // Jika null, kirim array kosong
    });

    return c.html(html);
  } catch (err) {
    console.error("Error in /sizeproduk/:id route:", err);
    return c.html(`<h1>Internal Server Error</h1>`);
  }
}); // YUDA PUSING MAK!!!
router.get("/extrasproduk/:id", async (c) => {
  try {
    console.log("Fetching product data..."); // Debug log
    const responseProduct = await fetch(
      `http://localhost:${PORT}/product/getproduct`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: c.req.param("id") }), // Pastikan pakai JSON.stringify
      }
    );

    console.log("Fetching size data...");
    const responseExtras = await fetch(
      `http://localhost:${PORT}/extras/listextras`
    );

    // Pastikan response HTTP oke sebelum lanjut
    if (!responseProduct.ok) throw new Error("Failed to fetch product data");
    if (!responseExtras.ok) throw new Error("Failed to fetch size data");

    const rawExtras = await responseExtras.json();
    console.log("Raw extras data:", rawExtras); // Debug data size

    const dataExtras =
      rawExtras.find((de) => de.id_product == c.req.param("id")) || null;
    console.log("Filtered dataExtras:", dataExtras);

    const dataProduct = await responseProduct.json();
    console.log("Product data:", dataProduct); // Debug product data

    const html = await renderEJS("extras", {
      title: "yuda",
      dataProduct,
      dataExtras, // Tetap kirim, tetapi bisa null
      dataDetailExtras: dataExtras ? dataExtras.extrasDetails || [] : [], // Jika null, kirim array kosong
    });

    return c.html(html);
  } catch (err) {
    console.error("Error in /extrasproduk/:id route:", err);
    return c.html(`<h1>Internal Server Error</h1>`);
  }
}); // YUDA PUSING MAK!!!

router.post("/submit-size", async (c) => {
  try {
    const body = await c.req.parseBody(); // Gunakan parseBody() untuk form data

    // Konversi sizeDetails menjadi array
    const sizeDetails = [];
    if (body["sizeDetails[0][name]"]) {
      let i = 0;
      while (body[`sizeDetails[${i}][name]`]) {
        sizeDetails.push({
          name: body[`sizeDetails[${i}][name]`],
          deskripsi: body[`sizeDetails[${i}][deskripsi]`] || "",
          id_extras: body[`sizeDetails[${i}][id_extras]`]
            ? new mongoose.Types.ObjectId(body[`sizeDetails[${i}][id_extras]`])
            : null,
        });
        i++;
      }
    }

    // Validasi input wajib
    if (!body.id_product || !body.name || body.deskripsi === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Ambil daftar ukuran yang tersedia dari endpoint /size/listsize
    const responseSize = await fetch(`http://localhost:${PORT}/size/listsize`);
    // const responseExtras = await fetch(`http://localhost:${PORT}/extras/listextras`);
    const dataSize = await responseSize.json();
    // const dataExtras = await responseExtras.json();

    if (!Array.isArray(dataSize)) {
      return c.json({ error: "Invalid data from /size/listsize" }, 500);
    }

    // Cari apakah size yang diberikan tersedia dalam database
    const sizeAvailable = dataSize.find((ds) => ds._id == body.id_size);
    // const extrasAda = dataSize.find(de => de.id_product == body.id_product)

    // Objek ukuran baru
    const newSize = {
      id_product: body.id_product,
      name: body.name,
      deskripsi: body.deskripsi,
      sizeDetails: sizeDetails,
    };

    let savedSize;

    if (sizeAvailable) {
      // Update ukuran jika sudah ada
      savedSize = await SizeModels.findOneAndUpdate(
        { id_product: body.id_product },
        { $set: newSize },
        { new: true, runValidators: true, upsert: true }
      );
    } else {
      // Buat ukuran baru jika tidak ada
      const newSizeModel = new SizeModels(newSize);
      savedSize = await newSizeModel.save();
    }

    // Pastikan ukuran sudah tersimpan sebelum memperbarui produk
    if (savedSize && savedSize._id) {
      await ProductModels.findByIdAndUpdate(
        body.id_product,
        { id_size: savedSize._id },
        { new: true, runValidators: true }
      );
    }

    // if (extrasAda) {
    //   await ExtrasModels.findOneAndUpdate(
    //     { id_product: body.id_product },
    //     { id_size: savedSize._id },
    //     { new: true, runValidators: true }
    //   );
    // }

    return c.redirect("/product");
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

router.post("/submit-extras", async (c) => {
  try {
    const body = await c.req.parseBody(); // Gunakan parseBody() untuk form data

    // Konversi extrasDetails menjadi array
    const extrasDetails = [];
    if (body["extrasDetails[0][name]"]) {
      let i = 0;
      while (body[`extrasDetails[${i}][name]`]) {
        extrasDetails.push({
          name: body[`extrasDetails[${i}][name]`],
          deskripsi: body[`extrasDetails[${i}][deskripsi]`] || "",
          // id_size: body[`extrasDetails[${i}][id_size]`]
          //   ? new mongoose.Types.ObjectId(body[`extrasDetails[${i}][id_size]`])
          //   : null,
        });
        i++;
      }
    }

    // Validasi input wajib
    if (!body.id_product || !body.name || body.deskripsi === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Ambil daftar extras yang tersedia dari endpoint /extras/listextras
    const responseExtras = await fetch(
      `http://localhost:${PORT}/extras/listextras`
    );
    // const responseSize = await fetch(`http://localhost:${PORT}/size/listsize`);
    const dataExtras = await responseExtras.json();
    // const dataSize = await responseSize.json();

    if (!Array.isArray(dataExtras)) {
      return c.json({ error: "Invalid data from /extras/listextras" }, 500);
    }

    // Cari apakah extras yang diberikan tersedia dalam database
    const extrasAvailable = dataExtras.find((de) => de._id == body.id_extras);
    // const sizeAda = dataSize.find(ds => ds.id_product == body.id_product)

    // Objek extras baru
    const newExtras = {
      id_product: body.id_product,
      name: body.name,
      deskripsi: body.deskripsi,
      extrasDetails: extrasDetails,
    };

    let savedExtras;

    if (extrasAvailable) {
      // Update extras jika sudah ada
      savedExtras = await ExtrasModels.findOneAndUpdate(
        { id_product: body.id_product },
        { $set: newExtras },
        { new: true, runValidators: true, upsert: true }
      );
    } else {
      // Buat extras baru jika tidak ada
      const newExtrasModel = new ExtrasModels(newExtras);
      savedExtras = await newExtrasModel.save();
    }

    // Pastikan extras sudah tersimpan sebelum memperbarui produk
    if (savedExtras && savedExtras._id) {
      await ProductModels.findByIdAndUpdate(
        body.id_product,
        { id_extras: savedExtras._id },
        { new: true, runValidators: true }
      );
    }

    // if (sizeAda) {
    //   await SizeModels.findOneAndUpdate(
    //     { id_product: body.id_product },
    //     { id_extras: savedExtras._id },
    //     { new: true, runValidators: true }
    //   );
    // }

    return c.redirect("/product");
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Yuda ACCB

export default router;
