import { Hono } from "hono";
import { OrderModels } from "@models/order-models";
import { mongoose } from "mongoose";

import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Get all order
router.post(
  "/listorder",
  (c, next) => authenticate(c, next, "order", OPERATIONS.READ),
  async (c) => {
    try {
      let body;
      try {
        body = await c.req.json();
      } catch (parseError) {
        return c.json({ error: "Invalid JSON payload" }, 400);
      }

      // If body is empty, fetch all orders
      if (!body || Object.keys(body).length === 0) {
        const order = await OrderModels.find().populate({
          path: "orderDetails.id_product",
          strictPopulate: false,
        });
        return c.json(order, 200);
      }

      // Build query based on request body
      const query = {};
      if (body.id_store) {
        if (typeof body.id_store !== "string") {
          return c.json({ error: "id_store must be a string" }, 400);
        }
        // Query for orders where any orderDetail has id_store matching the provided value
        query["orderDetails.id_store"] = body.id_store;
      }

      // Fetch orders matching the query and populate id_product only
      const order = await OrderModels.find(query).populate({
        path: "orderDetails.id_product",
        strictPopulate: false,
      });

      return c.json(order, 200);
    } catch (error) {
      console.error("Error:", error); // Log the error for debugging
      return c.text("Internal Server Error", 500);
    }
  }
);

// Get Order by ID
router.post(
  "/getorder",
  (c, next) => authenticate(c, next, "order", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID order diperlukan." }, 400);
      }

      const order = await OrderModels.findById(id).populate({
        path: "orderDetails.id_product", // Populate nested reference
        strictPopulate: false, // Ignore invalid references
      });

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
  }
);

// Add order
router.post(
  "/addorder",
  (c, next) => authenticate(c, next, "order", OPERATIONS.CREATE),
  async (c) => {
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
        total_quantity: body.total_quantity,
        total_price: body.total_price,
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
  }
);

router.post(
  "/transaksi-history",
  (c, next) => authenticate(c, next, "order", OPERATIONS.READ),
  async (c) => {
    try {
      const { id_company, id_store, filterBy, selectedDate } =
        await c.req.json();

      if (
        !mongoose.Types.ObjectId.isValid(id_company) ||
        !mongoose.Types.ObjectId.isValid(id_store)
      ) {
        return c.json(
          { success: false, message: "Invalid id_company or id_store" },
          { status: 400 }
        );
      }

      const objectIdCompany = new mongoose.Types.ObjectId(id_company);
      const objectIdStore = new mongoose.Types.ObjectId(id_store);

      let start_date, end_date;
      const now = new Date();

      if (filterBy === "daily") {
        start_date = new Date(selectedDate || now);
        start_date.setHours(0, 0, 0, 0);
        end_date = new Date(start_date);
        end_date.setHours(23, 59, 59, 999);
      } else if (filterBy === "monthly") {
        const date = new Date(selectedDate || now);
        start_date = new Date(date.getFullYear(), date.getMonth(), 1);
        end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        end_date.setHours(23, 59, 59, 999);
      } else if (filterBy === "yearly") {
        const date = new Date(selectedDate || now);
        start_date = new Date(date.getFullYear(), 0, 1);
        end_date = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else {
        return c.json(
          { success: false, message: "Invalid filterBy value" },
          400
        );
      }

      const matchQuery = {
        "orderDetails.id_company": objectIdCompany,
        "orderDetails.id_store": objectIdStore,
      };

      if (filterBy) {
        matchQuery["orderDetails.created_at"] = {
          $gte: start_date,
          $lte: end_date,
        };
      }

      const transactionHistory = await OrderModels.aggregate([
        {
          $match: matchQuery,
        },
        {
          $project: {
            _id: 1,
            no: 1,
            person_name: 1,
            code: 1,
            total_quantity: 1,
            total_price: 1,
            status: 1,
            keterangan: 1,
            created_at: 1,
            orderDetails: {
              $filter: {
                input: "$orderDetails",
                as: "detail",
                cond: {
                  $and: [
                    { $eq: ["$$detail.id_company", objectIdCompany] },
                    { $eq: ["$$detail.id_store", objectIdStore] },
                  ],
                },
              },
            },
            // id_sales_campaign: 1,
          },
        },
        { $sort: { created_at: -1 } },
      ]);

      for (const transaction of transactionHistory) {
        let total_price = 0;
        // let total_quantity = 0;
        for (const ord of transaction.orderDetails) {
          total_price += ord.total_price;
          // total_quantity += ord.quantity
        }

        transaction.total_price = total_price;
        // transaction.total_quantity = total_quantity;

        // delete transaction.orderDetails;
      }

      return c.json({ success: true, data: transactionHistory });
    } catch (error) {
      return c.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  }
);

export default router;
