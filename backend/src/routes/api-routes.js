import { Hono } from "hono";
import { ProductModels } from "@models/product-models";
import { CompanyModels } from "@models/company-models";
import { StoreModels } from "@models/store-models";
import { ExtrasModels } from "@models/extras-models";
import { UserModels } from "@models/user-models";
import { SizeModels } from "@models/size-models";
import { PaymentModels } from "@models/payment-models";
import { OrderModels } from "@models/order-models";
import { SalesModels } from "@models/sales-models";
import { salesCampaignModels } from "@models/salesCampaign-models";
import { CategoryProductModels } from "@models/categoryProduct-models";
import { itemCampaignModels } from "@models/itemCampaign";
import mongoose from "mongoose";
import fs from "fs/promises"; // For deleting files
import path from "path"; // For constructing file paths
// import bcrypt from "bcrypt";

const router = new Hono();

// Helper function to validate ID format
const validateIdFormat = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Invalid ID format" };
  }
  return null;
};

// Hash password
// const hashPassword = async (password) => {
//   const saltRounds = 10;
//   return await bcrypt.hash(password, saltRounds);
// };

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
    console.log(`Image file deleted successfully at ${fullPath}`);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error(`Failed to delete image file at ${fullPath}:`, err.message);
    }
  }
};

// === PRODUCT ===
router.put("/product/:id", async (c) => {
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
});

router.delete("/product/:id", async (c) => {
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
});

// === COMPANY ===
router.put("/company/:id", async (c) => {
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
});

router.delete("/company/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    CompanyModels,
    id,
    "Company"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});

// === STORE ===
router.put("/store/:id", async (c) => {
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
});

router.delete("/store/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    StoreModels,
    id,
    "Store"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});

// === EXTRAS ===
router.put("/extras/:id", async (c) => {
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
});

router.delete("/extras/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    ExtrasModels,
    id,
    "Extras"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});

// Extras
router.post("/submit-extras", async (c) => {
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
    console.log("EXTRAS:", newExtras);
    let savedExtras;
    if (existingExtras) {
      // Update existing extras
      savedExtras = await ExtrasModels.findOneAndUpdate(
        { id_product: body.id_product },
        { $set: newExtras },
        { new: true, runValidators: true }
      );
      console.log("SAVED EXTRAS:", savedExtras);
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
});
// Size
router.post("/submit-size", async (c) => {
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
            error: "Each detail in sizeDetails must have a name and deskripsi",
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
    console.log("EXTRAS:", newSize);
    let savedSize;
    if (existingSize) {
      // Update existing size
      savedSize = await SizeModels.findOneAndUpdate(
        { id_product: body.id_product },
        { $set: newSize },
        { new: true, runValidators: true }
      );
      console.log("SAVED EXTRAS:", savedSize);
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
    return c.json({ message: "Size saved successfully", data: savedSize }, 200);
  } catch (error) {
    console.error("Error:", error);
    return c.json({ error: error.message }, 500);
  }
});
// === CATEGORY ===
router.put("/category/:id", async (c) => {
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
});

router.delete("/category/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    CategoryProductModels,
    id,
    "Category"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});
// === USER ===
router.put("/user/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    // Validate ID format
    const validationError = validateIdFormat(id);
    if (validationError) return c.json(validationError, 400);

    // Validate request body
    if (!body || !body.username || !body.password) {
      return c.json(
        { error: "Missing required fields: username or password" },
        400
      );
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
});

router.delete("/user/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(UserModels, id, "user");
  return error ? c.json({ error }, status) : c.json({ message }, status);
});
// === PAYMENT ===
router.put("/payment/:id", async (c) => {
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
    const paymentName = Array.isArray(body.paymentName) ? body.paymentName : [];

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
});
router.delete("/payment/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    PaymentModels,
    id,
    "payment"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});
// === ORDER ===
router.put("/order/:id", async (c) => {
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
});

// router.delete("/payment/:id", async (c) => {
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
router.put("/sales/:id", async (c) => {
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
});

router.delete("/sales/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    SalesModels,
    id,
    "sales"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});

// === SALES CAMPAIGN ===
router.put("/salescampaign/:id", async (c) => {
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
});

router.delete("/salescampaign/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    salesCampaignModels,
    id,
    "salesCampaign"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});

// === ITEM CAMPAIGN ===
router.put("/itemcampaign/:id", async (c) => {
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
});

router.delete("/itemcampaign/:id", async (c) => {
  const id = c.req.param("id");
  const validationError = validateIdFormat(id);
  if (validationError) return c.json(validationError, 400);

  const { error, message, status } = await handleDelete(
    itemCampaignModels,
    id,
    "item_campaign"
  );
  return error ? c.json({ error }, status) : c.json({ message }, status);
});

export default router;
