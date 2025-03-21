import { Hono } from "hono";
import { itemCampaignModels } from "@models/itemCampaign";

import { authenticate, OPERATIONS } from "@middleware/authMiddleware";
const router = new Hono();

// Get all item campaigns
router.post(
  "/listitemcampaigns",
  (c, next) => authenticate(c, next, "item_campaign", OPERATIONS.READ),
  async (c) => {
    try {
      const body = await c.req.json();

      let { id_company, id_store } = body;

      // Validasi id_company agar tidak berisi string "undefined" atau null
      if (!id_company || id_company === "undefined" || id_company === "null") {
        id_company = null;
      }
      if (!id_store || id_store === "undefined" || id_store === "null") {
        id_store = null;
      }

      let query = {};
      if (id_company) query.id_company = id_company;
      if (id_store) query.id_store = id_store;

      // Query ke database
      const itemCampaigns = await itemCampaignModels.find(query);

      return c.json(itemCampaigns, 200);
    } catch (error) {
      return c.text("Internal Server Error", 500);
    }
  }
);

// Get item campaign by ID
router.post(
  "/getitemcampaign",
  (c, next) => authenticate(c, next, "item_campaign", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID item campaign diperlukan." }, 400);
      }

      const itemCampaign = await itemCampaignModels.findById(id);

      if (!itemCampaign) {
        return c.json({ message: "Item campaign tidak ditemukan." }, 404);
      }

      return c.json(itemCampaign, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil item campaign.",
          error: error.message,
        },
        500
      );
    }
  }
);

// Add item campaign
router.post(
  "/additemcampaign",
  (c, next) => authenticate(c, next, "item_campaign", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const itemCampaign = new itemCampaignModels(body);
      await itemCampaign.save();
      return c.json(itemCampaign, 201);
    } catch (error) {
      return c.text("Terjadi kesalahan saat menambahkan item campaign.", 400);
    }
  }
);

export default router;
