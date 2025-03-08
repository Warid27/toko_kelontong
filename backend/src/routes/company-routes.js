import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { CompanyModels } from "@models/company-models";
import { mongoose } from "mongoose";

// Middleware
import { authenticate } from "@middleware/authMiddleware"; // Import the middleware

const router = new Hono();

// Get all company
router.post("/listcompany", authenticate, async (c) => {
  try {
    // Fetch all companies from the database
    const companies = await CompanyModels.find().lean(); // Use `.lean()` for better performance

    // Check if any companies exist
    if (!companies || companies.length === 0) {
      return c.json({ message: "No companies found" }, 404);
    }

    // Return the list of companies
    return c.json(companies, 200);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

// Get Company by ID
router.post("/getcompany", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID perusahaan diperlukan." }, 400);
    }

    const company = await CompanyModels.findById(id);

    if (!company) {
      return c.json({ message: "Perusahaan tidak ditemukan." }, 404);
    }

    return c.json(company, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil perusahaan.",
        error: error.message,
      },
      500
    );
  }
});

// Add company
router.post("/addcompany", authenticate, async (c) => {
  try {
    const body = await c.req.json();
    const company = new CompanyModels(body);
    await company.save();
    return c.json(company, 201);
  } catch (error) {
    return c.json({ message: error.message }, 400);
  }
});

router.post("/listcompanylogo", async (c) => {
  try {
    // Fetch only name and logo fields from the database where status = 0
    const companies = await CompanyModels.find({ status: 0 }, "name logo").lean(
      {
        virtuals: true,
      }
    );

    // Map result to use resolvedLogo if available
    const response = companies.map((company) => ({
      name: company.name,
      logo: company.resolvedLogo || company.logo, // Prefer resolvedLogo if available
    }));

    return c.json(response, 200);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});


export default router;
