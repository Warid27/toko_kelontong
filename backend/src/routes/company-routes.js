import { Hono } from "hono";
import { PORT, renderEJS } from "@config/config";
import { CompanyModels } from "@models/company-models";
import { mongoose } from "mongoose";

const router = new Hono();

// Company Homepage

router.get("/", async (c) => {
  try {
    const response = await fetch(
      `http://localhost:${PORT}/company/listcompany`
    );
    const responseType = await fetch(`http://localhost:${PORT}/type/listtype`);
    // const responseCompany = await fetch()

    // Check if the response is OK (status 200)
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    // Ensure the response contains JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Received non-JSON response");
    }

    const data = await response.json(); // Parse JSON
    const dataType = await responseType.json(); // Parse JSON
    const html = await renderEJS("company", {
      title: "Home Page",
      data,
      dataType,
    });

    return c.html(html);
  } catch (error) {
    console.error("Error fetching company list:", error.message);
    return c.text("Failed to fetch company list", 500);
  }
});

// Get all company
router.post("/listcompany", async (c) => {
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
router.post("/getcompany", async (c) => {
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
router.post("/addcompany", async (c) => {
  // try {
  //   let body;
  //   let name;
  //   let address;
  //   let status;
  //   let phone;
  //   let email;

  //   // Check if the request is for JSON data
  //   if (
  //     c.req.header("accept") === "application/json" ||
  //     c.req.header("Content-Type") === "application/json"
  //   ) {
  //     // Parse JSON body
  //     body = await c.req.json();
  //     name: body.name;
  //     address: body.address;
  //     id_type: body.type ? body.type : body.id_type;
  //     status: body.status;
  //     phone: body.phone;
  //     email: body.email;
  //   } else {
  //     // If the body is URL-encoded, use URLSearchParams to parse it
  //     const rawBody = await c.req.text();
  //     body = new URLSearchParams(rawBody);
  //     name: body.get("name");
  //     address: body.get("address");
  //     id_type: body.get("type") ? body.get("type") : body.get("id_type");
  //     status: body.get("status");
  //     phone: body.get("phone");
  //     email: body.get("email");
  //   }

  //   console.log(data); // Log the request data

  //   const company = new CompanyModels(data);
  //   await company.save();

  //   // If request is JSON, return JSON response
  //   if (c.req.header("content-type") === "application/json") {
  //     return c.json(company, 201);
  //   }

  //   // Redirect for non-JSON requests
  //   // return c.redirect("/");
  //   return c.json(company, 201);
  // } catch (error) {
  //   return c.text("Terjadi kesalahan saat menambahkan perusahaan.", 400);
  // }
  try {
    const body = await c.req.json();
    const company = new CompanyModels(body);
    await company.save();
    return c.json(company, 201);
  } catch (error) {
    return c.json({ message: error.message }, 400);
  }
});

// Edit Company
router.post("/editcompany", async (c) => {
  try {
    let rawBody;
    if (c.req.header("accept") === "application/json") {
      rawBody = await c.req.text();
      rawBody = JSON.parse(rawBody);

      if (!rawBody.name || !rawBody.store_name || !rawBody.address) {
        return c.json(
          { error: "Missing required fields: name, store_name, or address" },
          400
        );
      }
      const companydata = await CompanyModelsfindByIdAndUpdate(id, rawBody, {
        new: true,
        runValidators: true,
      });

      return c.json({ message: "Request received", body: rawBody });
    } else {
      rawBody = await c.req.text();
      const body = new URLSearchParams(rawBody);
      const name = body.get("name");
      const store_name = body.get("store_name");
      const address = body.get("address");
      const id_type = body.get("id_type");
      const id = body.get("id");
      const status = body.get("status");
      const created_at = body.get("created_at");

      if (!name || !store_name || !address) {
        return c.json(
          { error: "Missing required fields: username, password, or rule" },
          400
        );
      }
      const data = {
        id,
        name,
        store_name,
        address,
        id_type,
        status,
      };
      const companydata = await CompanyModels.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return c.json({ data });

      // return c.redirect("/company");
    }
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengedit perusahaan.",
        error: error.message,
      },
      400
    );
  }
});

// Delete Company
router.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id"); // Get the ID from the URL parameter

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return c.json({ error: "Invalid user ID format" }, 400);
    }

    // Delete the company based on ID
    const company = await CompanyModels.deleteOne({ _id: id });

    if (!company.deletedCount) {
      // No company found to delete
      return c.json({ error: "Company not found" }, 404);
    }

    return c.json({ message: "Company deleted successfully" }, 200);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default router;
