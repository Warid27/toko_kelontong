import { Hono } from "hono";
import { itemCampaignModels } from "@models/itemCampaign";
import { mongoose } from "mongoose";

const router = new Hono();

// Get all item campaigns
router.post("/listitemcampaigns", async (c) => {
  try {
    const itemCampaigns = await itemCampaignModels.find();
    return c.json(itemCampaigns, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get item campaign by ID
router.post("/getitemcampaign", async (c) => {
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
});

// Add item campaign
router.post("/additemcampaign", async (c) => {
  try {
    const body = await c.req.json();
    const itemCampaign = new itemCampaignModels(body);
    await itemCampaign.save();
    return c.json(itemCampaign, 201);
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan item campaign.", 400);
  }
});

// Edit item campaign
router.patch("/edititemcampaign", async (c) => {
  try {
    const body = await c.req.json();
    const id = body.id;

    if (!id) {
      return c.json({ message: "ID item campaign diperlukan." }, 400);
    }

    const itemCampaign = await itemCampaignModels.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!itemCampaign) {
      return c.json({ message: "Item campaign tidak ditemukan." }, 404);
    }

    return c.json(itemCampaign, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengedit item campaign.",
        error: error.message,
      },
      400
    );
  }
});

// Delete item campaign
router.delete("/deleteitemcampaign/:id", async (c) => {
  try {
    const id = c.req.param("id");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid item campaign ID format" }, 400);
    }

    const itemCampaign = await itemCampaignModels.deleteOne({ _id: id });

    if (!itemCampaign.deletedCount) {
      return c.json({ error: "Item campaign not found" }, 404);
    }

    return c.json({ message: "Item campaign deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
