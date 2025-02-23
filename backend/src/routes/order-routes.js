import { Hono } from "hono";
import { OrderModels } from "@models/order-models";
import { mongoose } from "mongoose";
import { itemCampaignModels } from "@models/itemCampaign";
import { salesCampaignModels } from "@models/salesCampaign-models";

import { authenticate } from "@middleware/authMiddleware";

const router = new Hono();

// Get all order
router.post("/listorder", authenticate, async (c) => {
  try {
    // Fetch all orders from the database
    const order = await OrderModels.find();
    return c.json(order, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get Order by ID
router.post("/getorder", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID order diperlukan." }, 400);
    }

    const order = await OrderModels.findById(id);

    if (!order) {
      return c.json({ message: "order tidak ditemukan." }, 404);
    }

    return c.json(order, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil order.",
        error: error.message,
      },
      500
    );
  }
});

// Add order
router.post("/addorder", async (c) => {
  try {
    // Check if the request Content-Type is application/json
    if (c.req.header("content-type") !== "application/json") {
      return c.json({ error: "Only JSON requests are accepted." }, 400);
    }

    // Parse the incoming JSON body
    const body = await c.req.json();
    // Construct the data object
    const data = {
      no: body.no,
      code: body.code,
      person_name: body.person_name,
      status: body.status,
      id_table_cust: body.id_table_cust,
      keterangan: body.keterangan,
      orderDetails: body.orderDetails,
    };
    // Create and save the new order
    const order = new OrderModels(data);
    await order.save();

    // Return the created order as JSON with status 201
    return c.json(order, 201);
  } catch (error) {
    // Handle errors and return a JSON response
    return c.json(
      {
        error: "Terjadi kesalahan saat menambahkan perusahaan.",
        details: error.message,
      },
      400
    );
  }
});

// router.post("/transaksi-history", async (c) => {
//   try {
//     const { id_company, id_store } = await c.req.json();

//     if (!mongoose.Types.ObjectId.isValid(id_company) || !mongoose.Types.ObjectId.isValid(id_store)) {
//       return c.json({ success: false, message: "Invalid id_company or id_store" }, { status: 400 });
//     }

//     const objectIdCompany = new mongoose.Types.ObjectId(id_company);
//     const objectIdStore = new mongoose.Types.ObjectId(id_store);
//     const now = new Date();

//     const transactionHistory = await OrderModels.aggregate([
//       { $match: { "orderDetails.id_company": objectIdCompany, "orderDetails.id_store": objectIdStore } },
//       {
//         $project: {
//           _id: 1,
//           id_user: 1,
//           status: 1,
//           created_at: 1,
//           orderDetails: {
//             $filter: {
//               input: "$orderDetails",
//               as: "detail",
//               cond: {
//                 $and: [
//                   { $eq: ["$$detail.id_company", objectIdCompany] },
//                   { $eq: ["$$detail.id_store", objectIdStore] }
//                 ]
//               }
//             }
//           },
//           id_sales_campaign: 1
//         }
//       },
//       { $sort: { created_at: -1 } }
//     ]);

//     for (const transaction of transactionHistory) {
//       let total_price = 0;
//       let total_price_after_all = 0;

//       for (const ord of transaction.orderDetails) {
//         let discountItem = 0;
//         let discountSales = 0;

//         const itemPrice = ord.item_price;
//         const itemQuantity = ord.item_quantity;
//         const itemTotal = itemPrice * itemQuantity;
//         total_price += itemTotal;

//         if (ord.id_item_campaign) {
//           const itemCampaign = await itemCampaignModels.findById(ord.id_item_campaign);
//           if (itemCampaign) {
//             const startDate = new Date(itemCampaign.start_date);
//             const endDate = new Date(itemCampaign.end_date);

//             if (now >= startDate && now <= endDate) {
//               discountItem = parseFloat(itemCampaign.value) * itemTotal;
//             }
//           }
//         }

//         if (transaction.id_sales_campaign) {
//           const salesCampaign = await salesCampaignModels.findById(transaction.id_sales_campaign);
//           if (salesCampaign) {
//             const startDate = new Date(salesCampaign.start_date);
//             const endDate = new Date(salesCampaign.end_date);

//             if (now >= startDate && now <= endDate) {
//               discountSales = parseFloat(salesCampaign.value) * itemTotal;
//             }
//           }
//         }

//         total_price_after_all += itemTotal - discountItem - discountSales;
//       }

//       transaction.total_price = total_price;
//       transaction.total_price_after_all = total_price_after_all;

//       delete transaction.orderDetails;
//       delete transaction.id_sales_campaign;
//     }

//     return c.json({ success: true, data: transactionHistory });
//   } catch (error) {
//     return c.json({ success: false, message: error.message }, { status: 500 });
//   }
// });

export default router;
