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

// router.post("/file", authenticate, async (c) => {
//   try {
//     // 📌 1. Get form data
//     const formData = await c.req.formData();
//     const excelFile = formData.get("file");
//     const images = formData.getAll("images");
//     const id_store = formData.get("id_store");
//     const id_company = formData.get("id_company");

//     if (!excelFile) {
//       console.error("❌ [ERROR] Excel file is missing!");
//       return c.json({ message: "Excel file is required!" }, 400);
//     }

//     // 📌 2. Create necessary folders
//     const uploadDir = join(process.cwd(), "public/uploads");
//     const excelDir = join(uploadDir, "excels");

//     await mkdir(excelDir, { recursive: true });

//     // 📌 3. Save the Excel file locally
//     const excelPath = join(excelDir, excelFile.name);
//     const excelBuffer = await excelFile.arrayBuffer();
//     await writeFile(excelPath, Buffer.from(excelBuffer));

//     // 📌 4. Read Excel File
//     const workbook = XLSX.readFile(excelPath);
//     const sheetName = workbook.SheetNames[0];
//     let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     // 📌 5. Upload Images to MinIO and Get Public URLs
//     const imageURLs = {};
//     for (const image of images) {
//       const buffer = await image.arrayBuffer();
//       const ext = extname(image.name);
//       const uniqueFileName = `${crypto.randomUUID()}${ext}`;
//       const objectKey = `product/${uniqueFileName}`;

//       await minioClient.putObject(
//         MINIO_BUCKET_NAME,
//         objectKey,
//         Buffer.from(buffer),
//         image.size,
//         { "Content-Type": image.type }
//       );

//       const publicUrl = `${minioUrl}/${objectKey}`;
//       const shortKey = generateShortKey();
//       const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

//       // Save file metadata
//       const fileMetadata = new fileMetadataModels({
//         bucketName: MINIO_BUCKET_NAME,
//         objectName: objectKey,
//         fileUrl: publicUrl,
//         shortenedUrl,
//         shortkey: shortKey,
//       });
//       await fileMetadata.save();

//       imageURLs[image.name.split("/").pop().trim().toLowerCase()] =
//         shortenedUrl;
//     }

//     // 📌 6. Create a new Excel file with updated image URLs
//     const newExcelData = data.map((row) => ({
//       ...row,
//       image_url:
//         imageURLs[row.image?.split("/").pop().trim().toLowerCase()] ||
//         "https://placehold.co/600x400",
//       id_store,
//       id_company,
//     }));

//     const newSheet = XLSX.utils.json_to_sheet(newExcelData);
//     const newWorkbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);

//     const newExcelName = `updated_${excelFile.name}`;
//     const newExcelPath = join(excelDir, newExcelName);
//     XLSX.writeFile(newWorkbook, newExcelPath);

//     return c.json(newExcelData, 200);
//   } catch (error) {
//     console.error("❌ [ERROR] Upload failed:", error);
//     return c.json({ message: "Upload failed!", error: error.message }, 500);
//   }
// });

// router.post("/file", authenticate, async (c) => {
//   try {
//     console.log("📌 [INFO] Request received at /file endpoint");

//     // 📌 1. Get form data
//     const formData = await c.req.formData();
//     const excelFile = formData.get("file");
//     const images = formData.getAll("images");
//     const id_store = formData.get("id_store");
//     const id_company = formData.get("id_company");

//     if (!excelFile) {
//       console.error("❌ [ERROR] Excel file is missing!");
//       return c.json({ message: "Excel file is required!" }, 400);
//     }

//     // 📌 2. Generate a unique filename with date for the Excel file
//     const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
//     const safeFileName = excelFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
//     const uniqueExcelName = `excel/${
//       safeFileName.split(".")[0]
//     }-${currentDate}-${crypto.randomUUID().substring(0, 8)}.xlsx`;

//     // 📌 3. Upload the original Excel file to MinIO
//     const excelBuffer = await excelFile.arrayBuffer();
//     await minioClient.putObject(
//       MINIO_BUCKET_NAME,
//       uniqueExcelName,
//       Buffer.from(excelBuffer),
//       excelFile.size,
//       {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       }
//     );

//     const excelUrl = `${minioUrl}/${uniqueExcelName}`;
//     console.log("📌 [INFO] Excel file uploaded to MinIO:", excelUrl);

//     // 📌 4. Create a temporary file for ExcelJS to use
//     const tempDir = join(process.cwd(), "temp");
//     await mkdir(tempDir, { recursive: true });
//     const tempFilePath = join(tempDir, `temp-${crypto.randomUUID()}.xlsx`);
//     await writeFile(tempFilePath, Buffer.from(excelBuffer));

//     // 📌 5. Read Excel File with ExcelJS
//     const workbook = new ExcelJS.Workbook();
//     await workbook.xlsx.readFile(tempFilePath);
//     console.log("📌 [INFO] Excel file read successfully");

//     // Get the first worksheet
//     const worksheet = workbook.getWorksheet(1);
//     const data = [];
//     const headers = [];

//     // Extract headers from the first row
//     worksheet.getRow(1).eachCell((cell, colNumber) => {
//       headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
//     });
//     console.log("📌 [INFO] Extracted headers:", headers);

//     // Extract data from remaining rows
//     worksheet.eachRow((row, rowNumber) => {
//       if (rowNumber > 1) {
//         const rowData = {};
//         row.eachCell((cell, colNumber) => {
//           if (colNumber <= headers.length) {
//             rowData[headers[colNumber - 1]] = cell.value;
//           }
//         });
//         data.push(rowData);
//       }
//     });
//     console.log("📌 [INFO] Extracted data:", data.length, "rows");

//     // Clean up the temporary file
//     try {
//       await unlink(tempFilePath);
//       console.log("📌 [INFO] Temporary Excel file deleted");
//     } catch (unlinkError) {
//       console.warn("⚠️ [WARN] Could not delete temporary file:", unlinkError);
//     }

//     // 📌 6. Upload Images to MinIO and Get Public URLs
//     const imageURLs = {};
//     for (const image of images) {
//       console.log("📌 [INFO] Processing image:", image.name);
//       const buffer = await image.arrayBuffer();
//       const ext = extname(image.name);
//       const uniqueFileName = `${crypto.randomUUID()}${ext}`;
//       const objectKey = `product/${uniqueFileName}`;

//       await minioClient.putObject(
//         MINIO_BUCKET_NAME,
//         objectKey,
//         Buffer.from(buffer),
//         image.size,
//         { "Content-Type": image.type }
//       );

//       const publicUrl = `${minioUrl}/${objectKey}`;
//       const shortKey = generateShortKey();
//       const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

//       console.log("📌 [INFO] Image uploaded to MinIO:", publicUrl);

//       // Save file metadata
//       const fileMetadata = new fileMetadataModels({
//         bucketName: MINIO_BUCKET_NAME,
//         objectName: objectKey,
//         fileUrl: publicUrl,
//         shortenedUrl,
//         shortkey: shortKey,
//       });
//       await fileMetadata.save();

//       // Store with the image name (without path) as lowercase for matching
//       const imageName = image.name.split("/").pop().trim().toLowerCase();
//       imageURLs[imageName] = shortenedUrl;
//     }
//     console.log("📌 [INFO] Image processing complete");

//     // 📌 7. Create data with updated image URLs
//     const processedData = data.map((row) => {
//       // Make sure to handle undefined image field
//       const imageName = row.image?.split("/").pop()?.trim().toLowerCase();
//       return {
//         ...row,
//         image_url:
//           imageName && imageURLs[imageName]
//             ? imageURLs[imageName]
//             : "https://placehold.co/600x400",
//         id_store,
//         id_company,
//       };
//     });
//     console.log("📌 [INFO] Created Excel data with image URLs");

//     // 📌 8. Create an updated Excel file with the processed data
//     const updatedWorkbook = new ExcelJS.Workbook();
//     const updatedWorksheet = updatedWorkbook.addWorksheet("Sheet1");

//     // Add headers
//     const allKeys = Array.from(
//       new Set(processedData.flatMap((obj) => Object.keys(obj)))
//     );
//     updatedWorksheet.columns = allKeys.map((key) => ({ header: key, key }));

//     // Add rows
//     updatedWorksheet.addRows(processedData);

//     // Write to a buffer
//     const updatedExcelBuffer = await updatedWorkbook.xlsx.writeBuffer();

//     // Upload the updated Excel to MinIO
//     const updatedExcelName = `excel/updated_${
//       safeFileName.split(".")[0]
//     }-${currentDate}.xlsx`;
//     await minioClient.putObject(
//       MINIO_BUCKET_NAME,
//       updatedExcelName,
//       updatedExcelBuffer,
//       updatedExcelBuffer.length,
//       {
//         "Content-Type":
//           "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       }
//     );

//     const updatedExcelUrl = `${minioUrl}/${updatedExcelName}`;
//     console.log(
//       "📌 [INFO] Updated Excel file uploaded to MinIO:",
//       updatedExcelUrl
//     );

//     // 📌 9. Save the file metadata for the updated Excel
//     const updatedExcelMetadata = new fileMetadataModels({
//       bucketName: MINIO_BUCKET_NAME,
//       objectName: updatedExcelName,
//       fileUrl: updatedExcelUrl,
//       shortenedUrl: updatedExcelUrl,
//       shortkey: generateShortKey(),
//     });
//     await updatedExcelMetadata.save();

//     // Return both the data and file URLs
//     return c.json(
//       {
//         success: true,
//         data: processedData,
//         originalExcelUrl: excelUrl,
//         updatedExcelUrl: updatedExcelUrl,
//         count: processedData.length,
//       },
//       200
//     );
//   } catch (error) {
//     console.error("❌ [ERROR] Upload failed:", error);
//     return c.json({ message: "Upload failed!", error: error.message }, 500);
//   }
// });
router.post("/file", authenticate, async (c) => {
  try {
    console.log("📌 [INFO] Request received at /file endpoint");

    // 📌 1. Get form data
    const formData = await c.req.formData();
    const uploadedFile = formData.get("file");
    const images = formData.getAll("images");
    const id_store = formData.get("id_store");
    const id_company = formData.get("id_company");

    if (!uploadedFile) {
      console.error("❌ [ERROR] File is missing!");
      return c.json({ message: "File is required!" }, 400);
    }

    const originalFileName = uploadedFile.name;
    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const safeFileName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileExt = originalFileName.split(".").pop().toLowerCase();
    
    let convertedBuffer;
    let fileType;
    let finalFileName;

    // 📌 2. Convert CSV to XLSX if necessary
    if (fileExt === "csv") {
      console.log("📌 [INFO] Converting CSV to XLSX");
      const csvBuffer = await uploadedFile.arrayBuffer();
      const csvData = csvBuffer.toString();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");
      
      csvData.split("\n").forEach((row, index) => {
        worksheet.addRow(row.split(","));
      });
      
      convertedBuffer = await workbook.xlsx.writeBuffer();
      fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      finalFileName = `excel/${safeFileName.split(".")[0]}-${currentDate}.xlsx`;
    } else {
      console.log("📌 [INFO] Processing original Excel file");
      convertedBuffer = await uploadedFile.arrayBuffer();
      fileType = uploadedFile.type;
      finalFileName = `excel/${safeFileName.split(".")[0]}-${currentDate}-${crypto.randomUUID().substring(0, 8)}.xlsx`;
    }

    // 📌 3. Upload file to MinIO
    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      finalFileName,
      Buffer.from(convertedBuffer),
      convertedBuffer.length,
      { "Content-Type": fileType }
    );

    const fileUrl = `${minioUrl}/${finalFileName}`;
    console.log("📌 [INFO] File uploaded to MinIO:", fileUrl);

    // 📌 4. Process Excel File
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(convertedBuffer);
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

    // 📌 5. Upload Images to MinIO
    const imageURLs = {};
    for (const image of images) {
      console.log("📌 [INFO] Processing image:", image.name);
      const buffer = await image.arrayBuffer();
      const ext = extname(image.name);
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

      console.log("📌 [INFO] Image uploaded to MinIO:", publicUrl);
      imageURLs[image.name.toLowerCase()] = shortenedUrl;
    }
    console.log("📌 [INFO] Image processing complete");

    // 📌 6. Create updated data with image URLs
    const processedData = data.map((row) => {
      const imageName = row.image?.toLowerCase();
      return {
        ...row,
        image_url: imageName && imageURLs[imageName] ? imageURLs[imageName] : "https://placehold.co/600x400",
        id_store,
        id_company,
      };
    });
    console.log("📌 [INFO] Created processed data with image URLs");

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
