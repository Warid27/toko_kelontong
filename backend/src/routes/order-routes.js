import { Hono } from "hono";
import { PORT } from "@config/config";
import { OrderModels } from "@models/order-models";
import { mongoose } from "mongoose";
import { renderEJS } from "@config/config";

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

export default router;
