import { Hono } from "hono";
import { ProductModels } from "@models/product-models";
import { CategoryProductModels } from "@models/categoryProduct-models";
import { OrderModels } from "@models/order-models";
import { itemCampaignModels } from "@models/itemCampaign";

import { mongoose } from "mongoose";
import { StockModels } from "@models/stock-models";

import { fileMetadataModels } from "@models/fileMetadata-models";
import { authenticate } from "@middleware/authMiddleware"; // Import the middleware
import { join, extname } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import {
  minioClient,
  BACKEND_URI,
  MINIO_BUCKET_NAME,
  minioUrl,
} from "@config/config";
import crypto from "crypto";
import ExcelJS from "exceljs";

export const router = new Hono();

// Function to generate a short key
function generateShortKey(length = 8) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") // Convert to hexadecimal
    .slice(0, length); // Truncate to desired length
}

router.post("/file", authenticate, async (c) => {
  try {
    console.log("📌 [INFO] Request received at /file endpoint");

    // Get form data
    const formData = await c.req.formData();
    const uploadedFile = formData.get("file");
    const images = formData.getAll("images");
    const id_store = formData.get("id_store");
    const id_company = formData.get("id_company");

    if (!uploadedFile) {
      console.error("❌ [ERROR] File is missing!");
      return c.json({ message: "File is required!" }, 400);
    }

    // Process the uploaded file
    const { buffer, fileType, fileName } = await processUploadedFile(
      uploadedFile
    );

    // Upload file to MinIO
    const fileUrl = await uploadToMinio(
      MINIO_BUCKET_NAME,
      fileName,
      buffer,
      fileType
    );
    console.log("📌 [INFO] File uploaded to MinIO:", fileUrl);

    // Extract data from Excel file
    const { headers, data } = await extractExcelData(buffer);

    // Extract required image names from Excel data
    const requiredImages = extractRequiredImageNames(data);
    console.log("📌 [INFO] Required images from Excel:", requiredImages);

    // Filter and process only the images that are referenced in the Excel data
    const imageURLs = await processFilteredImages(images, requiredImages);

    // Create processed data with image URLs
    const processedData = createProcessedData(
      data,
      imageURLs,
      id_store,
      id_company
    );

    // Return response
    return c.json(
      {
        success: true,
        data: processedData,
        fileUrl,
        count: processedData.length,
      },
      200
    );
  } catch (error) {
    console.error("❌ [ERROR] Upload failed:", error);
    return c.json({ message: "Upload failed!", error: error.message }, 500);
  }
});

// Helper functions
async function processUploadedFile(uploadedFile) {
  const originalFileName = uploadedFile.name;
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
  const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileExt = originalFileName.split(".").pop().toLowerCase();

  let buffer, fileType, fileName;

  if (fileExt === "csv") {
    console.log("📌 [INFO] Converting CSV to XLSX");
    const csvBuffer = await uploadedFile.arrayBuffer();
    const csvData = new TextDecoder().decode(csvBuffer);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    csvData.split("\n").forEach((row) => {
      worksheet.addRow(row.split(","));
    });

    buffer = await workbook.xlsx.writeBuffer();
    fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    fileName = `excel/${safeFileName.split(".")[0]}-${currentDate}.xlsx`;
  } else {
    console.log("📌 [INFO] Processing original Excel file");
    buffer = await uploadedFile.arrayBuffer();
    fileType = uploadedFile.type;
    fileName = `excel/${safeFileName.split(".")[0]}-${currentDate}-${crypto
      .randomUUID()
      .substring(0, 8)}.xlsx`;
  }

  return { buffer, fileType, fileName };
}

async function uploadToMinio(bucketName, fileName, buffer, fileType) {
  await minioClient.putObject(
    bucketName,
    fileName,
    Buffer.from(buffer),
    buffer.byteLength,
    { "Content-Type": fileType }
  );

  return `${minioUrl}/${fileName}`;
}

async function extractExcelData(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  console.log("📌 [INFO] Excel file read successfully");

  const worksheet = workbook.getWorksheet(1);
  const data = [];
  const headers = [];

  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
  });
  console.log("📌 [INFO] Extracted headers:", headers);

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        if (colNumber <= headers.length) {
          rowData[headers[colNumber - 1]] = cell.value;
        }
      });
      data.push(rowData);
    }
  });
  console.log("📌 [INFO] Extracted data:", data.length, "rows");

  return { headers, data };
}

// New function to extract required image names from Excel data
function extractRequiredImageNames(data) {
  const requiredImages = new Set();

  data.forEach((row) => {
    if (row.image) {
      const imageName = row.image.split("/").pop()?.trim().toLowerCase();
      if (imageName) {
        requiredImages.add(imageName);
      }
    }
  });

  return Array.from(requiredImages);
}

// Modified image processing function to only process required images
// Add this to the processFilteredImages function in the backend code

async function processFilteredImages(images, requiredImages) {
  const imageURLs = {};
  const requiredImageNames = new Set(requiredImages);

  console.log(
    `📌 [INFO] Total uploaded images: ${images.length}, Required images: ${requiredImages.length}`
  );

  for (const image of images) {
    // Extract the base filename without extension for comparison
    // This handles the case where Excel references "product1.jpg" but we upload "product1.webp"
    const originalImageName = image.name.split("/").pop();
    const baseImageName = originalImageName
      .replace(/\.[^.]+$/, "")
      .trim()
      .toLowerCase();

    // Check if any required image matches this base name (ignoring extension)
    const matchingRequiredImage = requiredImages.find((reqImg) => {
      const reqImgBase = reqImg
        .replace(/\.[^.]+$/, "")
        .trim()
        .toLowerCase();
      return reqImgBase === baseImageName;
    });

    // Skip processing if this image isn't referenced in the Excel file
    if (!matchingRequiredImage) {
      console.log(
        `📌 [INFO] Skipping image: ${originalImageName} (not referenced in Excel)`
      );
      continue;
    }

    console.log(
      `📌 [INFO] Processing required image: ${originalImageName} (matches Excel reference: ${matchingRequiredImage})`
    );
    const buffer = await image.arrayBuffer();
    const ext = image.name.endsWith(".webp") ? ".webp" : extname(image.name);
    const uniqueFileName = `${crypto.randomUUID()}${ext}`;
    const objectKey = `product/${uniqueFileName}`;

    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      objectKey,
      Buffer.from(buffer),
      image.size,
      { "Content-Type": image.type }
    );

    const publicUrl = `${minioUrl}/${objectKey}`;
    const shortKey = generateShortKey();
    const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

    // Save file metadata
    const fileMetadata = new fileMetadataModels({
      bucketName: MINIO_BUCKET_NAME,
      objectName: objectKey,
      fileUrl: publicUrl,
      shortenedUrl,
      shortkey: shortKey,
    });
    await fileMetadata.save();

    // Store URL with the correct matching name from Excel
    // This ensures we map to the exact name in the Excel file
    const matchingImageName = matchingRequiredImage.toLowerCase();
    imageURLs[matchingImageName] = shortenedUrl;

    // Also store with the base name to improve matching chances
    if (baseImageName !== matchingImageName) {
      imageURLs[baseImageName] = shortenedUrl;
    }
  }

  console.log(
    `📌 [INFO] Image processing complete. Processed ${
      Object.keys(imageURLs).length
    } images`
  );
  return imageURLs;
}

// Update the createProcessedData function to better handle extension differences
function createProcessedData(data, imageURLs, id_store, id_company) {
  return data.map((row) => {
    let imageUrl = "https://placehold.co/600x400"; // Default placeholder

    if (row.image) {
      const fullImageName = row.image.split("/").pop()?.trim().toLowerCase();
      const baseImageName = fullImageName
        .replace(/\.[^.]+$/, "")
        .trim()
        .toLowerCase();

      // Try to match by full name first, then by base name
      if (imageURLs[fullImageName]) {
        imageUrl = imageURLs[fullImageName];
      } else if (imageURLs[baseImageName]) {
        imageUrl = imageURLs[baseImageName];
      }
    }

    return {
      ...row,
      image_url: imageUrl,
      id_store,
      id_company,
    };
  });
}

// Add Product by Batch
router.post("/addbatch", authenticate, async (c) => {
  try {
    const body = await c.req.json(); // Expect an array of products
    console.log("Received request body:", body);

    if (!Array.isArray(body) || body.length === 0) {
      console.log("Invalid data format. Expecting an array.");
      return c.json({ error: "Invalid data format. Expecting an array." }, 400);
    }

    const insertedProducts = [];

    for (const item of body) {
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
        category,
        image_url,
      } = item;

      // Validate required fields
      if (
        !name_product ||
        !sell_price ||
        !buy_price ||
        !category ||
        !id_store ||
        !id_company
      ) {
        console.log("Missing required fields in item:", item);
        return c.json(
          { error: "Missing required fields in one or more items" },
          400
        );
      }

      // Get the id_category_product by category and id_store
      const trimmedCategory = category.trim();
      const trimmedIdStore = id_store.trim();

      const categoryData = await CategoryProductModels.findOne({
        name_category: { $regex: new RegExp(`^${trimmedCategory}$`, "i") },
        id_store: trimmedIdStore,
      });

      if (!categoryData) {
        console.log(`Category not found: ${category} for store ${id_store}`);
        return c.json(
          { error: `Category '${category}' not found for store ${id_store}` },
          400
        );
      }

      let productImage = image_url || "https://placehold.co/500x500";

      const productData = {
        name_product,
        id_category_product: categoryData._id, // Pastikan kategori ditemukan
        sell_price,
        buy_price,
        product_code,
        barcode,
        deskripsi,
        id_store,
        id_company,
        id_extras,
        id_size,
        image: productImage,
      };

      console.log("Processing product data:", productData);

      const product = new ProductModels(productData);
      const productDataSaved = await product.save();
      console.log("Product saved:", productDataSaved);

      const stockData = {
        id_product: productDataSaved._id,
        amount: 0,
      };

      console.log("Stock data before saving:", stockData);

      const stok = new StockModels(stockData);
      const savedStock = await stok.save();
      console.log("Stock saved:", savedStock);

      if (savedStock) {
        await ProductModels.findByIdAndUpdate(
          productDataSaved._id,
          { id_stock: savedStock._id },
          { new: true, runValidators: true }
        );
        console.log(
          `Stock ID ${savedStock._id} linked to product ${productDataSaved._id}`
        );
      }

      insertedProducts.push({
        product: productDataSaved,
        stock: savedStock,
      });
    }

    console.log("All products inserted successfully:", insertedProducts);

    return c.json({ success: true, products: insertedProducts }, 201);
  } catch (error) {
    console.error("Error adding batch products:", error);
    return c.json(
      { error: "Failed to add products", details: error.message },
      500
    );
  }
});
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
    if (body.id_store) query.id_store = body.id_store;
    if (body.id_company) query.id_company = body.id_company;
    if (body.status) query.status = body.status;
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
    return c.json({ success: true, savedStock, data: productData }, 201);
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
