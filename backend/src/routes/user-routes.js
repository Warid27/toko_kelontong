import { Hono } from "hono";
import { UserModels } from "@models/user-models";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";
import argon2 from "argon2";

const router = new Hono();

// Hash a password
async function hashPassword(password) {
  return await argon2.hash(password);
}

// Get all user
router.post(
  "/listuser",
  (c, next) => authenticate(c, next, "users", OPERATIONS.READ),
  async (c) => {
    try {
      const user = await UserModels.find();
      return c.json(user, 200);
    } catch (error) {
      return c.text("Internal Server Error", 500);
    }
  }
);

// Get User by ID
router.post("/getuser", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();
    if (!id) {
      return c.json({ message: "ID User diperlukan." }, 400);
    }

    const user = await UserModels.findById(id);

    if (!user) {
      return c.json({ message: "User tidak ditemukan." }, 404);
    }

    return c.json(user, 200);
  } catch (error) {
    return c.json(
      {
        message: "Terjadi kesalahan saat mengambil User.",
        error: error.message,
      },
      500
    );
  }
});

// Get Avatar by user ID
router.post("/getavatar", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ message: "ID perusahaan diperlukan." }, 400);
    }

    const user = await UserModels.findById(id);

    if (!user) {
      return c.json({ message: "Perusahaan tidak ditemukan." }, 404);
    }
    const avatar = user.avatar;
    return c.json(avatar, 200);
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
router.post(
  "/adduser",
  (c, next) => authenticate(c, next, "users", OPERATIONS.CREATE),
  async (c) => {
    try {
      const body = await c.req.json();

      // Check if username already exists
      const existingUser = await UserModels.findOne({
        username: body.username,
      });

      if (existingUser) {
        return c.text(
          "User already exists. Please choose a different username.",
          400
        );
      }
      const password = body.password;
      const hashedPassword = await hashPassword(password);
      const data = {
        username: body.username,
        password: hashedPassword,
        rule: body.rule,
        id_company: body.company ? body.company : body.id_company,
        id_store: body.store ? body.store : body.id_store,
        avatar: body.avatar ? body.avatar : "https://placehold.co/500x500",
        status: body.status,
      };

      // Save user data (with hashing)
      const userdata = await UserModels.create(data);

      // Return JSON response if request is JSON
      return c.json(userdata, 201);
    } catch (error) {
      return c.text("Terjadi kesalahan saat menambahkan pengguna.", 500);
    }
  }
);

export default router;
