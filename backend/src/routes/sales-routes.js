import { Hono } from "hono";
import { SalesModels } from "@models/sales-models";
import { mongoose } from "mongoose";
import { authenticate } from "@middleware/authMiddleware";
const router = new Hono();

// Get all sales
router.post("/listsales", authenticate, async (c) => {
  try {
    const sales = await SalesModels.find();
    return c.json(sales, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get sales by ID
router.post("/getsales", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID sales diperlukan." }, 400);
    }

    const sales = await SalesModels.findById(id);

    if (!sales) {
      return c.json({ message: "Sales tidak ditemukan." }, 404);
    }

    return c.json(sales, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil sales.",
        error: error.message,
      },
      500
    );
  }
});

// Add sales
router.post("/addsales", authenticate, async (c) => {
  try {
    // Parse the incoming JSON body
    const body = await c.req.json();

    // Create a new sales model instance with the parsed body
    const sales = new SalesModels(body);

    // Save the sales data to the database
    await sales.save();

    // Return the saved sales data with a 201 status code
    return c.json(sales, 201);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error while adding sales:", error);

    // Check if the error is a validation error from Mongoose
    if (error.name === "ValidationError") {
      return c.json(
        { message: "Validation failed.", errors: error.errors },
        400
      );
    }

    // Handle other types of errors (e.g., database connection issues)
    return c.text("Terjadi kesalahan saat menambahkan sales.", 500);
  }
});

// router.get("/best-selling", async (c) => {
//   try {
//     const bestSellingProducts = await SalesModels.aggregate([
//       { $unwind: "$salesDetails" },
//       {
//         $group: {
//           _id: "$salesDetails.id_product",
//           name: { $first: "$salesDetails.name" },
//           item_price: { $first: "$salesDetails.item_price" },
//           total_quantity: { $sum: "$salesDetails.item_quantity" },
//         },
//       },
//       { $sort: { total_quantity: -1 } },
//       { $limit: 5 },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           item_price: 1,
//           total_quantity: 1,
//         },
//       },
//     ]);

//     return c.json({ success: true, data: bestSellingProducts }, 200);
//   } catch (error) {
//     return c.json({ success: false, message: error.message }, 500);
//   }
// });

router.post("/best-selling", async (c) => {
  try {
    const { start_date, end_date, sort } = await c.req.json();

    if (!start_date || !end_date) {
      return c.json(
        { success: false, message: "start_date and end_date are required" },
        400
      );
    }

    const bestSellingProducts = await SalesModels.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(start_date),
            $lte: new Date(end_date),
          },
        },
      },
      { $unwind: "$salesDetails" },
      {
        $group: {
          _id: "$salesDetails.id_product",
          name: { $first: "$salesDetails.name" },
          item_price: { $first: "$salesDetails.item_price" },
          total_quantity: { $sum: "$salesDetails.item_quantity" },
        },
      },
      { $sort: sort },
      // { total_quantity: -1 }
      { $limit: 5 },
      {
        $project: {
          _id: 1,
          name: 1,
          item_price: 1,
          total_quantity: 1,
        },
      },
    ]);

    return c.json({ success: true, data: bestSellingProducts }, 200);
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500);
  }
});

router.post("/chart-price", async (c) => {
  try {
    const { id_company, id_store } = await c.req.json();
    const dailySales = await SalesModels.aggregate([
      {
        $match: {
          "salesDetails.id_company": objectIdCompany,
          "salesDetails.id_store": objectIdStore,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          total_price: { $sum: "$total_price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return c.json({ success: true, data: dailySales }, 200);
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500);
  }
});
// router.get("/chart-price", async (c) => {
//   try {
//     const dailySales = await SalesModels.aggregate([
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
//           total_price: { $sum: "$total_price" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     return c.json({ success: true, data: dailySales }, 200);
//   } catch (error) {
//     return c.json({ success: false, message: error.message }, 500);
//   }
// });

// UNIVERSAL
// router.get("/sales-today", async (c) => {
//   try {
//     const dailySales = await SalesModels.aggregate([
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
//           total_price: { $sum: "$total_price" },
//         },
//       },
//       { $sort: { _id: -1 } },
//       { $limit: 2 },
//     ]);

//     return c.json({ success: true, data: dailySales }, 200);
//   } catch (error) {
//     return c.json({ success: false, message: error.message }, 500);
//   }
// });

// FILTERING

router.post("/sales-today", async (c) => {
  try {
    const { id_company, id_store, limit } = await c.req.json();

    if (!id_company || !id_store) {
      return c.json(
        { success: false, message: "id_company and id_store are required" },
        400
      );
    }

    if (
      !mongoose.isValidObjectId(id_company) ||
      !mongoose.isValidObjectId(id_store)
    ) {
      return c.json(
        { success: false, message: "Invalid id_company or id_store" },
        400
      );
    }

    const objectIdCompany = new mongoose.Types.ObjectId(id_company);
    const objectIdStore = new mongoose.Types.ObjectId(id_store);

    const salesSummary = await SalesModels.aggregate([
      {
        $match: {
          "salesDetails.id_company": objectIdCompany,
          "salesDetails.id_store": objectIdStore,
        },
      },
      {
        $unwind: "$salesDetails",
      },
      {
        $match: {
          "salesDetails.id_company": objectIdCompany,
          "salesDetails.id_store": objectIdStore,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          total_sales: {
            $sum: {
              $multiply: [
                "$salesDetails.item_price",
                "$salesDetails.item_quantity",
              ],
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit || 2 },
    ]);

    // Return the response
    return c.json({ success: true, data: salesSummary }, 200);
  } catch (error) {
    console.error("Error:", error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

router.post("/transaksi-history", async (c) => {
  try {
    const { id_company, id_store } = await c.req.json();
    const transactionHistory = await SalesModels.find({ 
      id_company: new ObjectId(id_company),
      id_store: new ObjectId(id_store)
    })
      .select("id_user status created_at total_price")
      .sort({ created_at: -1 });

    return c.json({ success: true, data: transactionHistory });
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500);
  }
});
// router.get("/transaksi-history", async (c) => {
//   try {
//     const transactionHistory = await SalesModels.find()
//       .select("id_user status created_at total_price")
//       .sort({ created_at: -1 });

//     return c.json({ success: true, data: transactionHistory });
//   } catch (error) {
//     return c.json({ success: false, message: error.message }, 500);
//   }
// });

export default router;
