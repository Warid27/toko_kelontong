import { Hono } from "hono";
import { SalesModels } from "@models/sales-models";
import { itemCampaignModels } from "@models/itemCampaign";
import { salesCampaignModels } from "@models/salesCampaign-models";
import { ProductModels } from "@models/product-models";
import { mongoose } from "mongoose";
import { authenticate } from "@middleware/authMiddleware";
const router = new Hono();
const ObjectId = mongoose.Types.ObjectId;

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
    const { filterBy, sort, id_store, id_company } = await c.req.json();

    if (!mongoose.Types.ObjectId.isValid(id_company) || !mongoose.Types.ObjectId.isValid(id_store)) {
      return c.json({ success: false, message: "Invalid id_company or id_store" }, { status: 400 });
    }

    const objectIdCompany = new mongoose.Types.ObjectId(id_company);
    const objectIdStore = new mongoose.Types.ObjectId(id_store);

    let start_date, end_date;
    const now = new Date();

    if (filterBy === "daily") {
      start_date = new Date(now.setHours(0, 0, 0, 0));
      end_date = new Date(now.setHours(23, 59, 59, 999));
    } else if (filterBy === "weekly") {
      const firstDayOfWeek = now.getDate() - now.getDay();
      start_date = new Date(now.setDate(firstDayOfWeek));
      start_date.setHours(0, 0, 0, 0);
      end_date = new Date();
      end_date.setHours(23, 59, 59, 999);
    } else if (filterBy === "monthly") {
      start_date = new Date(now.getFullYear(), now.getMonth(), 1);
      end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const bestSellingProducts = await SalesModels.aggregate([
      { $unwind: "$salesDetails" },
      {
        $match: {
          "salesDetails.id_company": objectIdCompany,
          "salesDetails.id_store": objectIdStore,
          created_at: { $gte: start_date, $lte: end_date },
        },
      },
      {
        $group: {
          _id: "$salesDetails.id_product", // Mengelompokkan berdasarkan id_product
          name: { $first: "$salesDetails.name" },
          item_price: { $first: "$salesDetails.item_price" },
          total_quantity: { $sum: "$salesDetails.item_quantity" },
        },
      },
      { $sort: sort },
      { $limit: 5 }
    ]);

    return c.json({ success: true, data: bestSellingProducts }, 200);
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500);
  }
});


// router.post("/chart-price", async (c) => {
//   try {
//     const { id_company, id_store } = await c.req.json();
//     const dailySales = await SalesModels.aggregate([
//       {
//         $match: {
//           "salesDetails.id_company": objectIdCompany,
//           "salesDetails.id_store": objectIdStore,
//         },
//       },
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
    const { id_company, id_store, limit, sortni } = await c.req.json();

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
      { $sort: { _id: sortni || -1 } },
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

    if (!mongoose.Types.ObjectId.isValid(id_company) || !mongoose.Types.ObjectId.isValid(id_store)) {
      return c.json({ success: false, message: "Invalid id_company or id_store" }, { status: 400 });
    }

    const objectIdCompany = new mongoose.Types.ObjectId(id_company);
    const objectIdStore = new mongoose.Types.ObjectId(id_store);
    const now = new Date();

    const transactionHistory = await SalesModels.aggregate([
      { $match: { "salesDetails.id_company": objectIdCompany, "salesDetails.id_store": objectIdStore } },
      {
        $project: {
          _id: 1,
          id_user: 1,
          status: 1,
          created_at: 1,
          salesDetails: {
            $filter: {
              input: "$salesDetails",
              as: "detail",
              cond: {
                $and: [
                  { $eq: ["$$detail.id_company", objectIdCompany] },
                  { $eq: ["$$detail.id_store", objectIdStore] }
                ]
              }
            }
          },
          id_sales_campaign: 1
        }
      },
      { $sort: { created_at: -1 } }
    ]);

    for (const transaction of transactionHistory) {
      let total_price = 0;
      let total_price_after_all = 0;

      for (const sale of transaction.salesDetails) {
        let discountItem = 0;
        let discountSales = 0;

        const itemPrice = sale.item_price;
        const itemQuantity = sale.item_quantity;
        const itemTotal = itemPrice * itemQuantity;
        total_price += itemTotal;

        if (sale.id_item_campaign) {
          const itemCampaign = await itemCampaignModels.findById(sale.id_item_campaign);
          if (itemCampaign) {
            const startDate = new Date(itemCampaign.start_date);
            const endDate = new Date(itemCampaign.end_date);

            if (now >= startDate && now <= endDate) {
              discountItem = parseFloat(itemCampaign.value) * itemTotal;
            }
          }
        }

        if (transaction.id_sales_campaign) {
          const salesCampaign = await salesCampaignModels.findById(transaction.id_sales_campaign);
          if (salesCampaign) {
            const startDate = new Date(salesCampaign.start_date);
            const endDate = new Date(salesCampaign.end_date);

            if (now >= startDate && now <= endDate) {
              discountSales = parseFloat(salesCampaign.value) * itemTotal;
            }
          }
        }

        total_price_after_all += itemTotal - discountItem - discountSales;
      }

      transaction.total_price = total_price;
      transaction.total_price_after_all = total_price_after_all;

      delete transaction.salesDetails;
      delete transaction.id_sales_campaign;
    }

    return c.json({ success: true, data: transactionHistory });
  } catch (error) {
    return c.json({ success: false, message: error.message }, { status: 500 });
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

router.post("/sales-count", async (c) => {
  try {
    const { id_store, id_company } = await c.req.json();

    if (!mongoose.Types.ObjectId.isValid(id_company) || !mongoose.Types.ObjectId.isValid(id_store)) {
      return c.json({ success: false, message: "Invalid id_company or id_store" }, { status: 400 });
    }

    const objectIdCompany = new mongoose.Types.ObjectId(id_company);
    const objectIdStore = new mongoose.Types.ObjectId(id_store);

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const salesCount = await SalesModels.aggregate([
      { $unwind: "$salesDetails" },
      {
        $match: {
          "salesDetails.id_company": objectIdCompany,
          "salesDetails.id_store": objectIdStore,
          "salesDetails.created_at": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total_sales: { $sum: 1 },
        },
      },
    ]);

    const totalSales = salesCount.length > 0 ? salesCount[0].total_sales : 0;

    return c.json({ success: true, total_sales: totalSales }, 200);
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500);
  }
});
// router.post("/quantity-today", async (c) => {
//   try {
//     const { id_store, id_company } = await c.req.json();

//     if (!mongoose.Types.ObjectId.isValid(id_company) || !mongoose.Types.ObjectId.isValid(id_store)) {
//       return c.json({ success: false, message: "Invalid id_company or id_store" }, { status: 400 });
//     }

//     const objectIdCompany = new mongoose.Types.ObjectId(id_company);
//     const objectIdStore = new mongoose.Types.ObjectId(id_store);

//     // Tentukan rentang waktu untuk hari ini
//     const now = new Date();
//     const startOfDay = new Date(now.setHours(0, 0, 0, 0));
//     const endOfDay = new Date(now.setHours(23, 59, 59, 999));

//     const quantityCount = await SalesModels.aggregate([
//       { $unwind: "$salesDetails" },
//       {
//         $match: {
//           "salesDetails.id_company": objectIdCompany,
//           "salesDetails.id_store": objectIdStore,
//           "salesDetails.created_at": { $gte: startOfDay, $lte: endOfDay },
//         },
//       },
//       {
//         $group: {
//           _id: "$salesDetails.id_product",
//           id_item_campaign: {$push : "$salesDetails.id_item_campaign"},
//           id_sales_campaign : {$push : "$id_sales_campaign"},
//           total_quantity: { $sum: "$salesDetails.item_quantity" },
//         },
//       },
//     ]);

//     const totalQuantity = quantityCount.length > 0 ? quantityCount : 0;

//     return c.json({ success: true, total_quantity: totalQuantity }, 200);
//   } catch (error) {
//     return c.json({ success: false, message: error.message }, 500);
//   }
// });

router.post("/profit-today", async (c) => {
  try {
    const { id_store, id_company } = await c.req.json();

    if (!mongoose.Types.ObjectId.isValid(id_company) || !mongoose.Types.ObjectId.isValid(id_store)) {
      return c.json({ success: false, message: "Invalid id_company or id_store" }, { status: 400 });
    }

    const objectIdCompany = new mongoose.Types.ObjectId(id_company);
    const objectIdStore = new mongoose.Types.ObjectId(id_store);

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const sales = await SalesModels.aggregate([
      { $unwind: "$salesDetails" },
      {
        $match: {
          "salesDetails.id_company": objectIdCompany,
          "salesDetails.id_store": objectIdStore,
          "salesDetails.created_at": { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $project: {
          id_product: "$salesDetails.id_product",
          item_quantity: "$salesDetails.item_quantity",
          id_item_campaign: "$salesDetails.id_item_campaign",
          id_sales_campaign: "$id_sales_campaign",
        },
      },
    ]);

    let totalProfit = 0;

    for (const sale of sales) {
      const product = await ProductModels.findById(sale.id_product);
      if (!product) continue;

      const sellPrice = parseFloat(product.sell_price);
      const buyPrice = parseFloat(product.buy_price);
      const totalQuantity = sale.item_quantity;
      let discountItem = 0;
      let discountSales = 0;

      if (sale.id_item_campaign) {
        const itemCampaign = await itemCampaignModels.findById(sale.id_item_campaign);
        if (itemCampaign) {
          const startDate = new Date(itemCampaign.start_date);
          const endDate = new Date(itemCampaign.end_date);

          if (now >= startDate && now <= endDate) {
            discountItem = parseFloat(itemCampaign.value) * sellPrice * totalQuantity;
          }
        }
      }

      if (sale.id_sales_campaign) {
        const salesCampaign = await salesCampaignModels.findById(sale.id_sales_campaign);
        if (salesCampaign) {
          const startDate = new Date(salesCampaign.start_date);
          const endDate = new Date(salesCampaign.end_date);

          if (now >= startDate && now <= endDate) {
            discountSales = parseFloat(salesCampaign.value) * sellPrice * totalQuantity;
          }
        }
      }

      const profit = (sellPrice * totalQuantity) - (buyPrice * totalQuantity) - discountItem - discountSales;
      totalProfit += profit;
    }

    return c.json({ success: true, total_profit: totalProfit }, 200);
  } catch (error) {
    return c.json({ success: false, message: error.message }, 500);
  }
});





export default router;
