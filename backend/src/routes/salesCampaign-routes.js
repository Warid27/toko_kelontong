import { Hono } from "hono";
import { salesCampaignModels } from "@models/salesCampaign-models";
import { mongoose } from "mongoose";

const router = new Hono();

// Get all sales campaigns
router.post("/listsalescampaign", async (c) => {
  try {
    const campaigns = await salesCampaignModels.find();
    return c.json(campaigns, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get sales campaign by ID
router.post("/getsalescampaign", async (c) => {
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
router.post("/addsalescampaign", async (c) => {
  try {
    const body = await c.req.json();
    const campaign = new salesCampaignModels(body);
    await campaign.save();
    return c.json(campaign, 201);
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan campaign.", 400);
  }
});

// Edit sales campaign
router.patch("/editsalescampaign", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id;

    if (!id) {
      return c.json({ message: "ID campaign diperlukan." }, 400);
    }

    const campaign = await salesCampaignModels.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return c.json({ message: "Campaign tidak ditemukan." }, 404);
    }

    return c.json(campaign, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengedit campaign.",
        error: error.message,
      },
      400
    );
  }
});

// Delete sales campaign
router.delete("/delete-salescampaign/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid campaign ID format" }, 400);
    }

    const campaign = await salesCampaignModels.deleteOne({ _id: id });

    if (!campaign.deletedCount) {
      return c.json({ error: "Campaign not found" }, 404);
    }

    return c.json({ message: "Campaign deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
