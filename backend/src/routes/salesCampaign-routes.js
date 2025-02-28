import { Hono } from "hono";
import { salesCampaignModels } from "@models/salesCampaign-models";
import { mongoose } from "mongoose";
import { authenticate } from "@middleware/authMiddleware";
const router = new Hono();

// Get all sales campaigns
router.post("/listsalescampaign", authenticate, async (c) => {
  try {
    const { id_store } = await c.req.json();
    const campaigns = await salesCampaignModels.find({ id_store });
    return c.json(campaigns, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get sales campaign by ID
router.post("/getsalescampaign", authenticate, async (c) => {
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
});

// Add sales campaign
router.post("/addsalescampaign", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const campaign = new salesCampaignModels(body);
    await campaign.save();
    return c.json(campaign, 201);
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan campaign.", 400);
  }
});

export default router;
