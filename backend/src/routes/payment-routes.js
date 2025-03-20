import { Hono } from "hono";
import { PaymentModels } from "@models/payment-models";
const router = new Hono();

import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

// Get all payment

router.post(
  "/listpayment",
  (c, next) => authenticate(c, next, "payment", OPERATIONS.READ),
  async (c) => {
    try {
      // Parse the request body
      let body;
      try {
        body = await c.req.json(); // Attempt to parse the JSON body
      } catch (parseError) {
        return c.json({ error: "Invalid JSON payload" }, 400); // Handle invalid JSON
      }
      const data = await PaymentModels.find();
      return c.json(data, 200);
    } catch (error) {
      console.error("Error fetching payments:", error);
      return c.json(
        { error: "Internal Server Error", details: error.message },
        500
      );
    }
  }
);

// Get payment by ID
router.post(
  "/getpayment",
  (c, next) => authenticate(c, next, "payment", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID payment diperlukan." }, 400);
      }

      const payment = await PaymentModels.findById(id);

      if (!payment) {
        return c.json({ message: "Payment tidak ditemukan." }, 404);
      }

      return c.json(payment, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil payment.",
          error: error.message,
        },
        500
      );
    }
  }
);

// Add payment
// Route to add a new payment
router.post(
  "/addpayment",
  (c, next) => authenticate(c, next, "payment", OPERATIONS.CREATE),
  async (c) => {
    try {
      // Parse the request body
      const body = await c.req.json();

      // Validate required fields
      if (!body.payment_method) {
        return c.json({ error: "Missing required field: payment_method" }, 400);
      }

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

      // Prepare the new payment data
      const newPayment = {
        payment_method: body.payment_method,
        keterangan: body.keterangan,
        paymentName: paymentName,
      };

      // Create new payment
      const savedPayment = await PaymentModels.create(newPayment);

      // Return success response
      return c.json(
        { message: "Payment added successfully", data: savedPayment },
        201
      );
    } catch (error) {
      console.error("Error:", error);
      return c.json({ error: error.message }, 500);
    }
  }
);

export default router;
