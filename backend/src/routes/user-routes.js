import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { PORT, SECRET_KEY } from "@config/config";
import { UserModels } from "@models/user-models";
import jwt from "jsonwebtoken";
import accessValidation from "@validation/user-validation";
import { renderEJS } from "@config/config";

const router = new Hono();

// Comment it if you doesn't want token
// router.use('/listuser', accessValidation);
// router.use('/adduser', accessValidation);
// router.use('/getuser', accessValidation);
// router.use('/edituser', accessValidation);
// router.use('/delete/:id', accessValidation);
// Comment it if you doesn't want token

// User
router.get("/", async (c) => {
  try {
    const token = getCookie(c, "token");

    if (!token) {
      return c.text("No token found", 401);
    }

    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.id;
    } catch (err) {
      return c.redirect("/login");
    }

    const response = await fetch(`http://localhost:${PORT}/users/getuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    if (!response.ok) {
      throw new Error(`User fetch failed! Status: ${response.status}`);
    }

    const responseCompany = await fetch(
      `http://localhost:${PORT}/company/listcompany`
    );
    const responseStore = await fetch(
      `http://localhost:${PORT}/store/liststore`
    );

    if (!responseCompany.ok) {
      throw new Error(
        `Company fetch failed! Status: ${responseCompany.status}`
      );
    }
    if (!responseStore.ok) {
      throw new Error(`Store fetch failed! Status: ${responseStore.status}`);
    }

    const data = await response.json();
    const dataCompany = await responseCompany.json();
    const dataStore = await responseStore.json();

    const html = await renderEJS("user", {
      title: "Home Page",
      data,
      dataCompany,
      dataStore,
    });

    return c.html(html);
  } catch (error) {
    console.error("Error fetching user list:", error.message);
    return c.text("Failed to fetch user list", 500);
  }
});

// Get all user
router.post("/listuser", async (c) => {
  try {
    // Fetch all companies from the database
    const user = await UserModels.find();
    return c.json(user, 200);
  } catch (error) {
    return c.text("Internal Server Error", 500);
  }
});

// Get User by ID
router.post("/getuser", async (c) => {
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
router.post("/adduser", async (c) => {
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

// Edit User
router.patch("/edituser", async (c) => {
  try {
    const body = await c.req.json();
    const { id, ...updateData } = body; // Extract ID and other fields

    const user = await UserModels.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return c.text("User not found.", 404);
    }

    if (c.req.header("content-type") === "application/json") {
      return c.json(user);
    }

    return c.redirect("/user");
  } catch (error) {
    return c.text("Terjadi kesalahan saat mengedit pengguna.", 400);
  }
});

// Delete User
router.delete("/delete/:id", async (c) => {
  try {
    const id = c.req.param("id"); // Correct way to get route params in Hono

    if (!id) {
      return c.text("ID tidak ditemukan dalam permintaan.", 400);
    }

    const user = await UserModels.findByIdAndDelete(id);

    if (!user) {
      return c.text("User tidak ditemukan.", 404);
    }

    return c.json({ message: "User berhasil dihapus.", user });
  } catch (error) {
    return c.text("Terjadi kesalahan saat menghapus pengguna.", 500);
  }
});

export default router;
