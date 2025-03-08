import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { ProductModels } from "@models/product-models";
import { CategoryProductModels } from "@models/categoryProduct-models";
import { OrderModels } from "@models/order-models";
import { itemCampaignModels } from "@models/itemCampaign";

// import { SizeModels } from "@models/size-models";
// import { ExtrasModels } from "@models/extras-models";
import { join, extname } from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { createReadStream as fsStream } from "fs";
import csv from "csv-parser";
import * as XLSX from "xlsx";

import { ObjectId, mongoose } from "mongoose";
import fs from "fs/promises";
import { StockModels } from "@models/stock-models";

// Middleware
import { authenticate } from "@middleware/authMiddleware"; // Import the middleware

export const router = new Hono();

// const upload = multer({ dest: "uploads/" });

router.post("/upload", authenticate, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const id_store = formData.get("id_store");
  const id_company = formData.get("id_company");

  if (!file) {
    return c.json({ message: "File tidak ditemukan!" }, 400);
  }

  // Pastikan folder uploads ada
  const uploadDir = join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });

  // Simpan file sementara
  const buffer = await file.arrayBuffer();
  let filePath = join(uploadDir, file.name);
  await writeFile(filePath, Buffer.from(buffer));

  // Tentukan ekstensi file
  const ext = extname(filePath).toLowerCase();
  let results = [];

  try {
    if (ext === ".csv") {
      // Jika file CSV, gunakan csv-parser
      // await new Promise((resolve, reject) => {
      //   fsStream(filePath)
      //     .pipe(csv())
      //     .on("data", (data) => results.push(data))
      //     .on("end", resolve)
      //     .on("error", reject);
      // });
      // results = await new Promise((resolve, reject) => {
      //   const tempResults = [];
      //   fsStream(filePath)
      //     .pipe(csv({ skipEmptyLines: true, trim: true })) // Skip baris kosong & trim spasi
      //     .on("data", (data) => tempResults.push(data))
      //     .on("end", () => resolve(tempResults))
      //     .on("error", reject);
      // });
      filePath = filePath.replace(".csv", ".xlsx");
      const excelBuffer = await readFile(filePath);
      const workbook = XLSX.read(excelBuffer, { type: "buffer" });

      // Ambil sheet pertama
      const sheetName = workbook.SheetNames[0];
      results = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (ext === ".xlsx" || ext === ".xls") {
      // Jika file Excel, gunakan XLSX
      const excelBuffer = await readFile(filePath);
      const workbook = XLSX.read(excelBuffer, { type: "buffer" });

      // Ambil sheet pertama
      const sheetName = workbook.SheetNames[0];
      results = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return c.json({ message: "Format file tidak didukung!" }, 400);
    }

    // Proses mapping data ke format yang sesuai
    const formatData = await Promise.all(
      results.map(async (d) => {
        const category = await CategoryProductModels.findOne({
          name_category: d.category,
        });

        return {
          ...d,
          id_store: id_store,
          id_company: id_company,
          id_category_product: category ? category._id : null,
        };
      })
    );

    // Simpan data ke MongoDB
    const result = await ProductModels.insertMany(formatData);

    return c.json({ message: "Upload berhasil! Data disimpan.", result });
  } catch (error) {
    console.error("Gagal membaca atau menyimpan file:", error);
    return c.json(
      { message: "Gagal membaca atau menyimpan file!", error: error.message },
      500
    );
  }
});

// router.post("/upload", authenticate, async (c) => {
//   const formData = await c.req.formData();
//   const file = formData.get("file");
//   const id_store = formData.get("id_store");
//   const id_company = formData.get("id_company");

//   if (!file) {
//     return c.json({ message: "File tidak ditemukan!" }, 400);
//   }

//   // Pastikan folder uploads ada
//   const uploadDir = join(process.cwd(), "uploads");
//   await mkdir(uploadDir, { recursive: true });

//   // Simpan file sementara
//   const buffer = await file.arrayBuffer();
//   const filePath = join(uploadDir, file.name);
//   await writeFile(filePath, Buffer.from(buffer));

//   try {
//     // Baca file Excel
//     const excelBuffer = await readFile(filePath);
//     const workbook = XLSX.read(excelBuffer, { type: "buffer" });

//     // Ambil nama sheet pertama
//     const sheetName = workbook.SheetNames[0];
//     const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     // Hapus __rowNum__ dari setiap data
//     const cleanedData = data.map(({ __rowNum__, ...rest }) => rest);

//     // Perbaikan: Gunakan Promise.all agar bisa await findOne
//     const formatData = await Promise.all(
//       cleanedData.map(async (d) => {
//         const category = await CategoryProductModels.findOne({
//           name_category: d.category,
//         });

//         return {
//           ...d,
//           id_store: id_store,
//           id_company: id_company,
//           id_category_product: category ? category._id : null,
//         };
//       })
//     );

//     // Simpan ke MongoDB
//     const result = await ProductModels.insertMany(formatData);

//     return c.json({ message: "Upload berhasil! Data disimpan.", result });
//   } catch (error) {
//     console.error("Gagal membaca atau menyimpan file:", error);
//     return c.json(
//       { message: "Gagal membaca atau menyimpan file!", error: error.message },
//       500
//     );
//   }
// });

// router.post("/upload", async (c) => {
//     const req = c.req.raw;

//     // Gunakan middleware multer untuk upload file
//     await new Promise((resolve, reject) => {
//         upload.single("file")(req, {}, (err) => {
//             if (err) reject(err);
//             resolve();
//         });
//     });

//     // Ambil file yang diupload
//     const file = req.file;
//     if (!file) return c.json({ error: "No file uploaded" }, 400);

//     // Baca file Excel
//     const workbook = xlsx.readFile(file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     console.log("data excel= ", data)

//     // Simpan ke MongoDB
//     // await ProductModels.insertMany(data);

//     // Hapus file setelah diproses
//     // fs.unlinkSync(file.path);

//     return c.json({ message: "Upload success", data });
// });

// Get all product

router.post("/listproduct", authenticate, async (c) => {
  try {
    // Parse JSON payload
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return c.json({ error: "Invalid JSON payload" }, 400);
    }
    // If body is empty, fetch all products
    if (!body || Object.keys(body).length === 0) {
      const products = await ProductModels.find().populate([
        "id_extras",
        "id_size",
        "id_stock",
      ]);
      return c.json(products, 200);
    }

    // Build query based on request body
    const query = {};
    query.status = 0;
    if (body.id_store) query.id_store = body.id_store;
    if (body.id_company) query.id_company = body.id_company;
    if (body.id_category_product)
      query.id_category_product = body.id_category_product;

    // Fetch products matching the query
    const products = await ProductModels.find(query).populate([
      "id_extras",
      "id_size",
      "id_stock",
    ]);

    // Append order quantities if requested
    if (body.params === "order") {
      // Fetch all orders with status = 2, selecting only orderDetails
      const orders = await OrderModels.find(
        { status: 2 },
        { orderDetails: 1 }
      ).populate("orderDetails.id_product");

      // Map to store product-wise order quantities
      const orderQuantities = new Map();

      orders.forEach((order) => {
        order.orderDetails.forEach((detail) => {
          if (detail.id_product) {
            const productId = detail.id_product._id.toString();
            orderQuantities.set(
              productId,
              (orderQuantities.get(productId) || 0) + detail.quantity
            );
          }
        });
      });

      // Create a new array with `orderQty` added to each product
      const updatedProducts = products.map((product) => ({
        ...product.toObject(),
        orderQty: orderQuantities.get(product._id.toString()) || 0,
      }));

      return c.json(updatedProducts, 200);
    }

    return c.json(products, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});

// Get Product by ID
router.post("/getproduct", authenticate, async (c) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return c.json({ message: "Invalid JSON payload." }, 400);
    }

    const { id, params } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ message: "ID produk tidak valid atau diperlukan." }, 400);
    }

    // Fetch product and stock in parallel
    const [product, stock] = await Promise.all([
      ProductModels.findById(id).populate(["id_extras", "id_size"]).lean(),
      StockModels.findOne({ id_product: id }).lean(),
    ]);

    if (!product) {
      return c.json({ message: "Produk tidak ditemukan." }, 404);
    }

    let orderQty = 0;
    let discount = 0;
    let categoryName = null;

    // Jika params adalah "all", tambahkan orderQty, discount, dan categoryName
    if (params === "all") {
      const [item_campaign, category_product, orders] = await Promise.all([
        product.id_item_campaign
          ? itemCampaignModels.findById(product.id_item_campaign).lean()
          : null,
        product.id_category_product
          ? CategoryProductModels.findById(product.id_category_product).lean()
          : null,
        OrderModels.find(
          { status: 2, "orderDetails.id_product": id },
          { orderDetails: 1 }
        ).lean(),
      ]);

      // Ambil nilai discount jika campaign ditemukan
      if (item_campaign) {
        discount = item_campaign.value || 0;
      }

      // Ambil nama kategori jika ditemukan
      if (category_product) {
        categoryName = category_product.name_category || null;
      }

      // Hitung total orderQty berdasarkan orderDetails
      orders.forEach((order) => {
        order.orderDetails.forEach((detail) => {
          if (detail.id_product.toString() === id) {
            orderQty += detail.quantity;
          }
        });
      });
    }

    return c.json(
      {
        ...product,
        amount: stock?.amount || 0, // Pastikan amount adalah angka
        orderQty, // Tambahkan orderQty jika params = "all"
        discount, // Tambahkan discount jika params = "all"
        categoryName, // Tambahkan categoryName jika params = "all"
      },
      200
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil produk.",
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

router.post("/liststatus", async (c) => {
  try {
    // Fetch only name and logo fields from the database where status = 0
    const products = await ProductModels.find({ status: 0 }, "status");

    // Map result to use resolvedLogo if available
    const response = products.map((product) => ({
      status: product.status,
    }));

    return c.json(response, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

export default router;
