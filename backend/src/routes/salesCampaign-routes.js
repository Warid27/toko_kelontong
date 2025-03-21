import { Hono } from "hono";
import { salesCampaignModels } from "@models/salesCampaign-models";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";
const router = new Hono();

// Get all sales campaigns
router.post(
  "/listsalescampaign",
  (c, next) => authenticate(c, next, "salesCampaign", OPERATIONS.READ),
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

      const campaigns = await salesCampaignModels.find(query);
      return c.json(campaigns, 200);
    } catch (error) {
      return c.text("Internal Server Error", 500);
    }
  }
);

// Get sales campaign by ID
router.post(
  "/getsalescampaign",
  (c, next) => authenticate(c, next, "salesCampaign", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();

      if (!id) {
        return c.json({ message: "ID campaign diperlukan." }, 400);
      }

      const campaign = await salesCampaignModels.findById(id);

      if (!campaign) {
        return c.json({ message: "Campaign tidak ditemukan." }, 404);
      }

      return c.json(campaign, 200);
    } catch (error) {
      return c.json(
        {
          message: "Terjadi kesalahan saat mengambil campaign.",
          error: error.message,
        },
        500
      );
    }
  }
);

// Add sales campaign
router.post(
  "/addsalescampaign",
  (c, next) => authenticate(c, next, "salesCampaign", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();
      const campaign = new salesCampaignModels(body);
      await campaign.save();
      return c.json(campaign, 201);
    } catch (error) {
      return c.text("Terjadi kesalahan saat menambahkan campaign.", 400);
    }
  }
);

export default router;
