import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { PORT, SECRET_KEY } from "@config/config";
import { UserModels } from "@models/user-models";
import jwt from "jsonwebtoken";
import { renderEJS } from "@config/config";
import { authenticate } from "@middleware/authMiddleware";

const router = new Hono();

// Get all user
router.post("/listuser", authenticate, async (c) => {
  try {
    // Fetch all companies from the database
    const user = await UserModels.find();
    return c.json(user, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get User by ID
router.post("/getuser", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID perusahaan diperlukan." }, 400);
    }

    const user = await UserModels.findById(id);

    if (!user) {
      return c.json({ message: "Perusahaan tidak ditemukan." }, 404);
    }

    return c.json(user, 200);
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

// AddUser from Admin
router.post("/adduser", authenticate, async (c) => {
  try {
    const body = await c.req.json(); // Parse JSON request body

    const data = {
      username: body.username,
      password: body.password,
      rule: body.rule,
      id_company: body.company ? body.company : body.id_company,
      id_store: body.store ? body.store : body.id_store,
      status: body.status,
    };

    if (data.rule == "admin" || data.rule == 1) {
      data.rule = 1;
    }
    if (data.id_company == "besar" || data.id_company == 2) {
      data.id_company = 2;
    }
    data.status = data.status == "active" ? 1 : 0;

    // Check if username already exists
    const existingUser = await UserModels.findOne({ username: data.username });

    if (existingUser) {
      return c.text(
        "User already exists. Please choose a different username.",
        400
      );
    }

    // Save user data (without hashing)
    const userdata = await UserModels.insertMany(data);

    // Return JSON response if request is JSON
    if (c.req.header("content-type") === "application/json") {
      return c.json(userdata);
    }

    // Redirect to /user
    return c.redirect("/user");
  } catch (error) {
    return c.text("Terjadi kesalahan saat menambahkan pengguna.", 500);
  }
});

export default router;
