import { Hono } from "hono";
import { PembelianModels } from "@models/pembelian-models";

import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Get all purchases
router.post(
  "/listpembelian",
  (c, next) => authenticate(c, next, "pembelian", OPERATIONS.READ),
  async (c) => {
    try {
      const pembelian = await PembelianModels.find();
      return c.json(pembelian, 200);
    } catch (error) {
      return c.text("Internal Server Error", 500);
    }
  }
);

// Get purchase by ID
router.post(
  "/getpembelian",
  (c, next) => authenticate(c, next, "pembelian", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID pembelian diperlukan." }, 400);
      }

      const pembelian = await PembelianModels.findById(id);

      if (!pembelian) {
        return c.json({ message: "Pembelian tidak ditemukan." }, 404);
      }

      return c.json(pembelian, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil pembelian.",
          error: error.message,
        },
        500
      );
    }
  }
);

router.post(
  "/addpembelian",
  (c, next) => authenticate(c, next, "pembelian", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const pembelian = new PembelianModels(body);
      await pembelian.save();

      return c.json(pembelian, 201);
    } catch (error) {
      console.error("Error adding pembelian:", error); // Menampilkan error lebih jelas
      return c.json(
        { message: "Terjadi kesalahan", error: error.message },
        400
      );
    }
  }
);

export default router;
