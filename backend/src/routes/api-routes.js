import { Hono } from "hono";
import {
  minioClient,
  BACKEND_URI,
  MINIO_BUCKET_NAME,
  minioUrl,
} from "@config/config";
import { ProductModels } from "@models/product-models";
import { CompanyModels } from "@models/company-models";
import { StoreModels } from "@models/store-models";
import { RuleAccessModels } from "@models/rule_access-models";
import { StockModels } from "@models/stock-models";
import { ExtrasModels } from "@models/extras-models";
import { UserModels } from "@models/user-models";
import { SizeModels } from "@models/size-models";
import { PaymentModels } from "@models/payment-models";
import { OrderModels } from "@models/order-models";
import { SalesModels } from "@models/sales-models";
import { salesCampaignModels } from "@models/salesCampaign-models";
import { CategoryProductModels } from "@models/categoryProduct-models";
import { itemCampaignModels } from "@models/itemCampaign";
import { TypeModels } from "@models/type-models";
import { fileMetadataModels } from "@models/fileMetadata-models";

// Middleware
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

// Package
import mongoose from "mongoose";
import fs from "fs/promises"; // For deleting files
import path from "path"; // For constructing file paths
import argon2 from "argon2";
import crypto from "crypto";
import { Buffer } from "buffer";
import { password } from "bun";

const router = new Hono();

// Utility function to generate a short key
function generateShortKey(length = 8) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") // Convert to hexadecimal
    .slice(0, length); // Truncate to desired length
}

// Hash a password
async function hashPassword(password) {
  return await argon2.hash(password);
}

// Helper function to validate ID format
const validateIdFormat = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Invalid ID format" };
  }
  return null;
};

// Helper function to handle update operations

// Helper function to handle update operations
const handleUpdate = async (Model, id, body, modelName) => {
  try {
    const result = await Model.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return { error: `${modelName} not found`, status: 404 };
    }
    return { data: result, status: 200 };
  } catch (error) {
    return {
      error: `Error updating ${modelName}: ${error.message}`,
      status: 400,
    };
  }
};
// Helper function to handle delete operations
const handleDelete = async (Model, id, modelName, imagePath = null) => {
  try {
    const result = await Model.findByIdAndDelete(id);
    if (!result) {
      return { error: `${modelName} not found`, status: 404 };
    }

    if (imagePath) {
      await deleteImageFile(imagePath);
    }

    return { message: `${modelName} deleted successfully`, status: 200 };
  } catch (error) {
    console.error(`Error deleting ${modelName}:`, error);
    return { error: "An unexpected error occurred", status: 500 };
  }
};

// Helper function to delete an image file
const deleteImageFile = async (imagePath) => {
  if (!imagePath) return;

  const uploadsDir = path.resolve("uploads");
  const fullPath = path.join(uploadsDir, path.basename(imagePath));

  try {
    await fs.access(fullPath); // Check if the file exists
    await fs.unlink(fullPath); // Delete the file
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Failed to delete image file at ${fullPath}:`, err.message);
    }
  }
};

// === MinIO ===

router.post(
  "/upload-file",
  (c, next) => authenticate(c, next, "file_metadata", OPERATIONS.CREATE),
  async (c) => {
    try {
      // Parse the form data
      const formData = await c.req.formData();
      const file = formData.get("file");
      const pathPrefix = formData.get("pathPrefix");
      const id_user = formData.get("id_user");

      // Validate the file
      if (!file || !(file instanceof File)) {
        return c.json({ error: "File is required" }, 400);
      }

      // Validate file type (only allow .rar)
      const ext = path.extname(file.name).toLowerCase();
      if (ext !== ".rar") {
        return c.json({ error: "Only .rar files are allowed" }, 400);
      }

      // Validate the path prefix
      if (!pathPrefix || typeof pathPrefix !== "string") {
        return c.json({ error: "Path prefix is required" }, 400);
      }

      // Generate a unique file name
      const fileName = `${crypto.randomUUID()}${ext}`;
      const objectKey = `${pathPrefix}/${fileName}`;

      // Read the file buffer
      const fileBuffer = await file.arrayBuffer();

      // Upload the file to MinIO
      await minioClient.putObject(
        MINIO_BUCKET_NAME,
        objectKey,
        Buffer.from(fileBuffer),
        file.size,
        file.type || "application/x-rar-compressed" // Set correct MIME type
      );

      // Generate download URL
      const downloadUrl = `${minioUrl}/${objectKey}`;

      // Save file metadata to the database
      const fileMetadata = new fileMetadataModels({
        bucketName: MINIO_BUCKET_NAME,
        objectName: objectKey,
        fileUrl: downloadUrl,
        id_user: id_user || null,
      });

      await fileMetadata.save();

      // Return success response with download link
      return c.json(
        {
          success: true,
          metadata: {
            bucketName: fileMetadata.bucketName,
            objectName: fileMetadata.objectName,
            fileUrl: fileMetadata.fileUrl, // Direct download link
          },
        },
        201
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      return c.json(
        { error: "Failed to upload file", details: error.message },
        500
      );
    }
  }
);
router.post(
  "/upload",
  (c, next) => authenticate(c, next, "file_metadata", OPERATIONS.CREATE),
  async (c) => {
    try {
      // Parse the form data
      const formData = await c.req.formData();
      const file = formData.get("file");
      const pathPrefix = formData.get("pathPrefix");
      const id_user = formData.get("id_user");

      // Validate the file
      if (!file || !(file instanceof File)) {
        return c.json({ error: "File is required" }, 400);
      }

      // Validate the path prefix
      if (!pathPrefix || typeof pathPrefix !== "string") {
        return c.json({ error: "Path prefix is required" }, 400);
      }

      // Generate a unique file name
      const ext = path.extname(file.name); // Get the file extension
      const fileName = `${crypto.randomUUID()}${ext}`; // Create a unique file name
      const objectKey = `${pathPrefix}/${fileName}`; // Define the object key (including the path prefix)

      // Read the file buffer
      const fileBuffer = await file.arrayBuffer();
      // Upload the file to MinIO
      await minioClient.putObject(
        MINIO_BUCKET_NAME,
        objectKey, // Include the path prefix in the object key
        Buffer.from(fileBuffer), // Convert the file buffer to a format MinIO understands
        file.size, // File size
        file.type // File MIME type (e.g., image/jpeg)
      );

      // Generate URL
      const publicUrl = `${minioUrl}/${objectKey}`;

      // Generate a short key
      const shortKey = generateShortKey();

      // Construct the shortened URL
      const shortenedUrl = `${BACKEND_URI}/api/image/${shortKey}`;

      // Save file metadata to the database
      const fileMetadata = new fileMetadataModels({
        bucketName: MINIO_BUCKET_NAME,
        objectName: objectKey,
        fileUrl: publicUrl,
        shortenedUrl: shortenedUrl,
        shortkey: shortKey,
        id_user: id_user || null,
      });

      // Save the metadata to the database
      await fileMetadata.save();

      // Return success response
      return c.json(
        {
          success: true,
          metadata: {
            bucketName: fileMetadata.bucketName,
            objectName: fileMetadata.objectName,
            fileUrl: fileMetadata.fileUrl,
            shortenedUrl: fileMetadata.shortenedUrl,
            shortKey: fileMetadata.shortkey,
          },
        },
        201
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      return c.json(
        { error: "Failed to upload image", details: error.message },
        500
      );
    }
  }
);

router.get("/image/:shortKey", async (c) => {
  try {
    const shortKey = c.req.param("shortKey");

    // Look up the file metadata using the short key
    const fileMetadata = await fileMetadataModels.findOne({
      shortkey: shortKey,
    });

    if (!fileMetadata) {
      return c.json({ error: "File not found" }, 404);
    }

    // Redirect to the original MinIO file URL
    return c.redirect(fileMetadata.fileUrl, 302);
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    return c.json(
      { error: "Failed to fetch file metadata", details: error.message },
      500
    );
  }
});

// === MinIO ===

// === PRODUCT ===
router.put(
  "/product/:id",
  (c, next) => authenticate(c, next, "product", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);
    const { error, data, status } = await handleUpdate(
      ProductModels,
      id,
      body,
      "Product"
    );

    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/product/:id",
  (c, next) => authenticate(c, next, "product", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const product = await ProductModels.findById(id);
    if (!product) return c.json({ error: "Product not found" }, 404);

    const { error, message, status } = await handleDelete(
      ProductModels,
      id,
      "Product",
      product.image
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === STOCK ===

/* RESERVE TIDAK DIGUNAKAN
router.put("/reserve", async (c) => {
  try {
    // Parse request body
    const body = await c.req.json();

    // Pastikan ID dalam format ObjectId
    if (!mongoose.Types.ObjectId.isValid(body.id_product)) {
      return c.json({ error: "Invalid ID format." }, 400);
    }

    const id = new mongoose.Types.ObjectId(body.id_product);

    // Validasi action dan quantity
    const { action, quantity } = body;
    if (!["add", "remove", "confirm"].includes(action)) {
      return c.json(
        { error: "Invalid action. Must be 'add', 'remove', or 'confirm'." },
        400
      );
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      return c.json(
        { error: "Invalid quantity. Must be a positive number." },
        400
      );
    }

    // Menyiapkan kondisi query dan update
    let updateQuery = {};
    let condition = { id_product: id };

    if (action === "add") {
      condition.amount = { $gte: quantity }; // Pastikan stok cukup
      updateQuery = { $inc: { reserved_amount: quantity } };
    } else if (action === "remove") {
      condition.reserved_amount = { $gte: quantity };
      updateQuery = { $inc: { reserved_amount: -quantity } };
    } else if (action === "confirm") {
      condition.reserved_amount = { $gte: quantity };
      condition.amount = { $gte: quantity };
      updateQuery = {
        $inc: {
          reserved_amount: -quantity,
          amount: -quantity,
        },
      };
    }

    // Eksekusi update atomik
    const updatedStock = await StockModels.findOneAndUpdate(
      condition,
      updateQuery,
      { new: true, runValidators: true }
    );

    if (!updatedStock) {
      return c.json({ error: "Stock not found or condition not met." }, 404);
    }

    return c.json(
      {
        message: "Stock reservation updated successfully.",
        stock: updatedStock,
      },
      200
    );
  } catch (error) {
    console.error("Error updating reserved stock:", error);
    return c.json({ error: "An unexpected error occurred." }, 500);
  }
});
*/

router.put(
  "/stock",
  (c, next) => authenticate(c, next, "stock", OPERATIONS.UPDATE),
  async (c) => {
    try {
      const body = await c.req.json();

      const id = body.id_product;
      const validationError = validateIdFormat(id);
      if (validationError) {
        return c.json(validationError, 400);
      }

      const { params, amount } = body;
      if (!["in", "out"].includes(params)) {
        return c.json({ error: "Invalid params. Must be 'in' or 'out'." }, 400);
      }
      if (typeof amount !== "number" || amount <= 0) {
        return c.json(
          { error: "Invalid amount. Must be a positive number." },
          400
        );
      }

      const dataStock = await StockModels.findOne({ id_product: id });
      if (!dataStock) {
        return c.json({ error: "Stock not found." }, 404);
      }

      // Update jumlah stok
      if (params === "out") {
        dataStock.amount -= amount;
      } else if (params === "in") {
        dataStock.amount += amount;
      }

      const updateBody = { amount: dataStock.amount };
      const id_stock = dataStock._id;
      const { error, data, status } = await handleUpdate(
        StockModels,
        id_stock,
        updateBody,
        "stock"
      );

      if (error) {
        return c.json({ error }, status);
      }

      return c.json({ message: "Stock updated successfully.", data }, status);
    } catch (error) {
      console.error("Error updating stock:", error);
      return c.json({ error: "An unexpected error occurred." }, 500);
    }
  }
);

router.delete(
  "/stock/:id",
  (c, next) => authenticate(c, next, "stock", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const stock = await StockModels.findById(id);
    if (!stock) return c.json({ error: "Stock not found" }, 404);

    const { error, message, status } = await handleDelete(
      StockModels,
      id,
      "stock"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === COMPANY ===
router.put(
  "/company/:id",
  (c, next) => authenticate(c, next, "company", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      CompanyModels,
      id,
      body,
      "Company"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.put("/company_status/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const validStatuses = [0, 1, 2];
  if (!validStatuses.includes(Number(body.status))) {
    return c.json({ error: "Invalid status value" }, 400);
  }

  try {
    const currentCompany = await CompanyModels.findById(id);
    if (!currentCompany) return c.json({ error: "Company not found" }, 404);

    const currentStatus = Number(currentCompany.status);
    const targetStatus = Number(body.status);

    const isActivationChange = currentStatus === 1 && targetStatus === 0;
    const isDeactivationChange = currentStatus === 0 && targetStatus === 1;

    const { error, data, status: responseStatus } = await handleUpdate(
      CompanyModels,
      id,
      body,
      "Company"
    );

    if (error) return c.json({ error }, responseStatus);

    const objectIdCompany = new mongoose.Types.ObjectId(id);

    if (isDeactivationChange) {
      await StoreModels.updateMany({ id_company: objectIdCompany }, { status: 1 });
      await UserModels.updateMany({ id_company: objectIdCompany }, { status: 2 });
    } else if (isActivationChange) {
      // Optional: uncomment ini kalau mau aktifkan lagi
      /*
      await StoreModels.updateMany({ id_company: objectIdCompany }, { status: 0 });
      await UserModels.updateMany({ id_company: objectIdCompany }, { status: 0 });
      */
    }

    return c.json({
      ...data,
      message: isActivationChange || isDeactivationChange
        ? "Company and related entities updated successfully"
        : "Company updated successfully"
    }, responseStatus);

  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});


router.delete(
  "/company/:id",
  (c, next) => authenticate(c, next, "company", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      CompanyModels,
      id,
      "Company"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === STORE ===
router.put(
  "/store/:id",
  (c, next) => authenticate(c, next, "store", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);
    const { error, data, status } = await handleUpdate(
      StoreModels,
      id,
      body,
      "Store"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/store/:id",
  (c, next) => authenticate(c, next, "store", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      StoreModels,
      id,
      "Store"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === RULE ACCESS ===
router.put(
  "/rule/:id",
  (c, next) => authenticate(c, next, "rule", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);
    const { error, data, status } = await handleUpdate(
      RuleAccessModels,
      id,
      body,
      "rule_access"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/rule/:id",
  (c, next) => authenticate(c, next, "rule", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      RuleAccessModels,
      id,
      "RuleAccess"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === EXTRAS ===
router.put(
  "/extras/:id",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      ExtrasModels,
      id,
      body,
      "Extras"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/extras/:id",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      ExtrasModels,
      id,
      "Extras"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// Extras

router.post(
  "/submit-extras",
  (c, next) => authenticate(c, next, "extras", OPERATIONS.CREATE),
  async (c) => {
    try {
      // Parse the request body
      const body = await c.req.json();

      // Validate required fields
      if (!body.id_product || !body.name || !body.deskripsi) {
        return c.json(
          { error: "Missing required fields: id_product, name, or deskripsi" },
          400
        );
      }

      // Handle optional extrasDetails
      let extrasDetails = [];
      if (Array.isArray(body.extrasDetails)) {
        // Validate each detail in extrasDetails
        const invalidDetail = body.extrasDetails.find(
          (detail) => !detail.name || !detail.deskripsi
        );
        if (invalidDetail) {
          return c.json(
            {
              error:
                "Each detail in extrasDetails must have a name and deskripsi",
            },
            400
          );
        }
        extrasDetails = body.extrasDetails;
      }

      // Check if extras already exists for the product
      const existingExtras = await ExtrasModels.findOne({
        id_product: body.id_product,
      });

      // Prepare the new extras data
      const newExtras = {
        id_product: body.id_product,
        name: body.name,
        deskripsi: body.deskripsi,
        extrasDetails: extrasDetails, // Use the validated or default extrasDetails
      };
      let savedExtras;
      if (existingExtras) {
        // Update existing extras
        savedExtras = await ExtrasModels.findOneAndUpdate(
          { id_product: body.id_product },
          { $set: newExtras },
          { new: true, runValidators: true }
        );
      } else {
        // Create new extras
        const newExtrasModel = new ExtrasModels(newExtras);
        savedExtras = await newExtrasModel.save();
      }

      // Link the extras to the product
      if (savedExtras && savedExtras._id) {
        await ProductModels.findByIdAndUpdate(
          body.id_product,
          { id_extras: savedExtras._id },
          { new: true, runValidators: true }
        );
      }

      // Return success response
      return c.json(
        { message: "Extras saved successfully", data: savedExtras },
        200
      );
    } catch (error) {
      console.error("Error:", error);
      return c.json({ error: error.message }, 500);
    }
  }
);
// Size
router.post(
  "/submit-size",
  (c, next) => authenticate(c, next, "size", OPERATIONS.CREATE),
  async (c) => {
    try {
      // Parse the request body
      const body = await c.req.json();

      // Validate required fields
      if (!body.id_product || !body.name || !body.deskripsi) {
        return c.json(
          { error: "Missing required fields: id_product, name, or deskripsi" },
          400
        );
      }

      // Handle optional sizeDetails
      let sizeDetails = [];
      if (Array.isArray(body.sizeDetails)) {
        // Validate each detail in sizeDetails
        const invalidDetail = body.sizeDetails.find(
          (detail) => !detail.name || !detail.deskripsi
        );
        if (invalidDetail) {
          return c.json(
            {
              error:
                "Each detail in sizeDetails must have a name and deskripsi",
            },
            400
          );
        }
        sizeDetails = body.sizeDetails;
      }

      // Check if size already exists for the product
      const existingSize = await SizeModels.findOne({
        id_product: body.id_product,
      });

      // Prepare the new size data
      const newSize = {
        id_product: body.id_product,
        name: body.name,
        deskripsi: body.deskripsi,
        sizeDetails: sizeDetails, // Use the validated or default sizeDetails
      };
      let savedSize;
      if (existingSize) {
        // Update existing size
        savedSize = await SizeModels.findOneAndUpdate(
          { id_product: body.id_product },
          { $set: newSize },
          { new: true, runValidators: true }
        );
      } else {
        // Create new size
        const newSizeModel = new SizeModels(newSize);
        savedSize = await newSizeModel.save();
      }

      // Link the size to the product
      if (savedSize && savedSize._id) {
        await ProductModels.findByIdAndUpdate(
          body.id_product,
          { id_size: savedSize._id },
          { new: true, runValidators: true }
        );
      }

      // Return success response
      return c.json(
        { message: "Size saved successfully", data: savedSize },
        200
      );
    } catch (error) {
      console.error("Error:", error);
      return c.json({ error: error.message }, 500);
    }
  }
);

router.delete(
  "/size/:id",
  (c, next) => authenticate(c, next, "size", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      SizeModels,
      id,
      "Size"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === CATEGORY ===
router.put(
  "/category/:id",
  (c, next) => authenticate(c, next, "category_product", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      CategoryProductModels,
      id,
      body,
      "Category"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/category/:id",
  (c, next) => authenticate(c, next, "category_product", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      CategoryProductModels,
      id,
      "Category"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);
// === TYPE ===
router.put(
  "/type/:id",
  (c, next) => authenticate(c, next, "type", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      TypeModels,
      id,
      body,
      "typeType"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/type/:id",
  (c, next) => authenticate(c, next, "type", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      TypeModels,
      id,
      "type"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);
// === USER ===

router.put("/profile/:id", authenticate, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    // Validate ID format
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    // Initialize reqBody
    const reqBody = {};

    // Include username if provided
    if (body.username) {
      reqBody.username = body.username;
    }

    // Include avatar if provided
    if (body.avatar) {
      reqBody.avatar = body.avatar;
    }

    // Hash the password if provided
    if (body.password) {
      try {
        reqBody.password = await hashPassword(body.password);
      } catch (hashError) {
        return c.json({ error: "Failed to hash password" }, 500);
      }
    }

    // Call handleUpdate with validated inputs
    const { error, data, status } = await handleUpdate(
      UserModels,
      id,
      reqBody,
      "user"
    );

    // Return response
    return error ? c.json({ error }, status) : c.json(data, status);
  } catch (err) {
    console.error("Error in /user/:id PUT route:", err.message);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.put(
  "/user/:id",
  (c, next) => authenticate(c, next, "users", OPERATIONS.UPDATE),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();

      // Validate ID format
      const validationError = validateIdFormat(id);
      if (validationError) return c.json(validationError, 400);

      // Convert empty strings to null for id_company and id_store
      if (body.id_company === "") {
        body.id_company = null;
      }
      if (body.id_store === "") {
        body.id_store = null;
      }

      // Hash the password if it exists in the request body
      if (body.password) {
        try {
          body.password = await hashPassword(body.password); // Replace plain text password with hashed password
        } catch (hashError) {
          return c.json({ error: "Failed to hash password" }, 500);
        }
      } else {
        delete body.password; // Remove password field if it's empty/null
      }

      // Call handleUpdate with validated inputs
      const { error, data, status } = await handleUpdate(
        UserModels,
        id,
        body,
        "user"
      );

      // Return response
      return error ? c.json({ error }, status) : c.json(data, status);
    } catch (err) {
      console.error("Error in /user/:id PUT route:", err.message);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

router.delete(
  "/user/:id",
  (c, next) => authenticate(c, next, "user", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      UserModels,
      id,
      "user"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === PAYMENT ===
router.put(
  "/payment/:id",
  (c, next) => authenticate(c, next, "payment", OPERATIONS.UPDATE),
  async (c) => {
    try {
      // Extract the payment ID from the URL parameters
      const id = c.req.param("id");

      // Parse the request body
      const body = await c.req.json();

      // Validate required fields
      if (!body.payment_method) {
        return c.json({ error: "Missing required field: payment_method" }, 400);
      }

      // Set default values for optional fields
      const keterangan = body.keterangan || null;
      const paymentName = Array.isArray(body.paymentName)
        ? body.paymentName
        : [];

      // Validate paymentName (if provided)
      const invalidDetail = paymentName.find(
        (detail) => !detail.payment_name || !detail.payment_desc
      );
      if (invalidDetail) {
        return c.json(
          {
            error:
              "Each detail in paymentName must have a payment_name and payment_desc",
          },
          400
        );
      }

      // Check if the payment exists
      const existingPayment = await PaymentModels.findById(id);
      if (!existingPayment) {
        return c.json({ error: "No payment found with the given ID" }, 404);
      }

      // Prepare the updated payment data
      const updatedPayment = {
        payment_method: body.payment_method,
        keterangan: keterangan,
        paymentName: paymentName,
      };

      // Update the payment
      const savedPayment = await PaymentModels.findByIdAndUpdate(
        id,
        { $set: updatedPayment },
        { new: true, runValidators: true }
      );

      // Return success response
      return c.json(
        { message: "Payment updated successfully", data: savedPayment },
        200
      );
    } catch (error) {
      console.error("Error:", error);
      return c.json({ error: error.message }, 500);
    }
  }
);
router.delete(
  "/payment/:id",
  (c, next) => authenticate(c, next, "payment", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      PaymentModels,
      id,
      "payment"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);
// === ORDER ===
router.put(
  "/order/:id",
  (c, next) => authenticate(c, next, "order", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      OrderModels,
      id,
      body,
      "order"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

// router.delete("/payment/:id", authenticate, async (c) => {
//   const id = c.req.param("id");
//   const validationError = validateIdFormat(id);
//   if (validationError) return c.json(validationError, 400);

//   const { error, message, status } = await handleDelete(
//     PaymentModels,
//     id,
//     "payment"
//   );
//   return error ? c.json({ error }, status) : c.json({ message }, status);
// });

// === SALES ===
router.put(
  "/sales/:id",
  (c, next) => authenticate(c, next, "sales", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      SalesModels,
      id,
      body,
      "sales"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/sales/:id",
  (c, next) => authenticate(c, next, "sales", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      SalesModels,
      id,
      "sales"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === SALES CAMPAIGN ===
router.put(
  "/salescampaign/:id",
  (c, next) => authenticate(c, next, "salesCampaign", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      salesCampaignModels,
      id,
      body,
      "salesCampaign"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/salescampaign/:id",
  (c, next) => authenticate(c, next, "salesCampaign", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      salesCampaignModels,
      id,
      "salesCampaign"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

// === ITEM CAMPAIGN ===
router.put(
  "/itemcampaign/:id",
  (c, next) => authenticate(c, next, "item_campaign", OPERATIONS.UPDATE),
  async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();

    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, data, status } = await handleUpdate(
      itemCampaignModels,
      id,
      body,
      "item_campaign"
    );
    return error ? c.json({ error }, status) : c.json(data, status);
  }
);

router.delete(
  "/itemcampaign/:id",
  (c, next) => authenticate(c, next, "item_campaign", OPERATIONS.DELETE),
  async (c) => {
    const id = c.req.param("id");
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    const { error, message, status } = await handleDelete(
      itemCampaignModels,
      id,
      "item_campaign"
    );
    return error ? c.json({ error }, status) : c.json({ message }, status);
  }
);

router.post("/viewtablewithrelation", authenticate, async (c) => {
  try {
    const { tableName, filters = {}, relationships = [] } = await c.req.json();
    if (!models[tableName]) {
      return c.json({ error: "Invalid table name" }, 400);
    }
    let query = models[tableName].find(filters).lean();
    relationships.forEach((rel) => {
      if (models[rel.referenceTable]) {
        query = query.populate({
          path: rel.foreignKey,
          model: models[rel.referenceTable],
          select: rel.select || "",
          match: rel.relationshipFilters || {},
        });
      }
    });
    const result = await query.exec();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

const models = {
  users: UserModels,
  store: StoreModels,
  company: CompanyModels,
};

router.post("/viewtablewithrelation", authenticate, async (c) => {
  try {
    const { tableName, filters = {}, relationships = [] } = c.req.body;

    if (!models[tableName]) {
      return c.status(400).json({ error: "Invalid table name" });
    }

    let query = models[tableName].find(filters).lean();

    relationships.forEach((rel) => {
      if (models[rel.referenceTable]) {
        query = query.populate({
          path: rel.foreignKey,
          model: models[rel.referenceTable],
          select: rel.select || "",
          match: rel.relationshipFilters || {},
        });
      }
    });

    const result = await query.exec(); // Eksekusi query
    return c.res.json(result);
  } catch (error) {
    return c.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan daftar koleksi
router.post("/collections", authenticate, async (c) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }

    // Mendapatkan daftar koleksi dari Mongoose
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    // Ekstrak nama dan informasi koleksi
    const collectionList = collections.map((collection) => ({
      name: collection.name,
    }));

    return c.json({
      success: true,
      data: collectionList,
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch collections",
        message: error.message,
      },
      500
    );
  }
});

export default router;
