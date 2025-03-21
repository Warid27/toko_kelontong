import { Hono } from "hono";
import { StoreModels } from "@models/store-models";
import { mongoose } from "mongoose";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Store

// Add Store
router.post(
  "/addstore",
  (c, next) => authenticate(c, next, "store", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const { name, address, id_company, status, icon } = body;
      // Validate all required fields
      if (!name || !address || !id_company || status === undefined) {
        return c.json(
          {
            error:
              "Validation error: name, address, id_company, and status are required.",
          },
          400
        );
      }

      // Create a new store object with the parsed data
      const storeData = { name, address, id_company, status, icon };
      const store = new StoreModels(storeData);
      await store.save();

      return c.json(store);
    } catch (error) {
      return c.json({ error: error.message }, 400);
    }
  }
);

// Get all store
router.post(
  "/liststore",
  (c, next) => authenticate(c, next, "store", OPERATIONS.READ),
  async (c) => {
    try {
      const body = await c.req.json();

      let { id_company } = body;

      // Validasi id_company agar tidak berisi string "undefined" atau null
      if (!id_company || id_company === "undefined" || id_company === "null") {
        id_company = null;
      }

      let stores;
      if (id_company) {
        // Pastikan `id_company` valid sebelum dipakai dalam query
        if (!mongoose.Types.ObjectId.isValid(id_company)) {
          return c.json({ error: "Invalid id_company format" }, 400);
        }
        stores = await StoreModels.find({ id_company })
          .populate("decorationDetails")
          .lean();
      } else {
        stores = await StoreModels.find().populate("decorationDetails").lean();
      }
      return c.json(stores, 200);
    } catch (error) {
      console.error("Error fetching stores:", error);
      return c.json({ error: "An unexpected error occurred" }, 500);
    }
  }
);

router.post(
  "/getstore",
  (c, next) => authenticate(c, next, "store", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID Store diperlukan." }, 400);
      }

      const store = await StoreModels.findById(id);

      if (!store) {
        return c.json({ message: "Store tidak ditemukan." }, 404);
      }

      return c.json(store, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil Store.",
          error: error.message,
        },
        500
      );
    }
  }
);

router.post(
  "/getStoreImage",
  (c, next) => authenticate(c, next, "store", OPERATIONS.READ),
  async (c) => {
    try {
      const body = await c.req.json();
      const id = body.id;
      const params = body.params;
      if (!id) {
        return c.json({ message: "ID Store diperlukan." }, 400);
      }

      const store = await StoreModels.findById(id);

      if (!store) {
        return c.json({ message: "Store tidak ditemukan." }, 404);
      }
      let result;
      if (params == "icon") {
        result = store.icon;
      } else if (params == "banner") {
        result = store.banner;
      } else {
        return c.json({ message: "Params tidak ditemukan." }, 400);
      }
      return c.json(result, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil Store.",
          error: error.message,
        },
        500
      );
    }
  }
);

router.post("/liststatus", async (c) => {
  try {
    // Fetch only name and logo fields from the database where status = 0
    const stores = await StoreModels.find({ status: 0 }, "status");

    // Map result to use resolvedLogo if available
    const response = stores.map((store) => ({
      status: store.status,
    }));

    return c.json(response, 200);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

export default router;
