import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { PORT, JWT_SECRET } from "@config/config";
import { UserModels } from "@models/user-models";
import jwt from "jsonwebtoken";
import accessValidation from "@validation/user-validation";
import { renderEJS } from "@config/config";
import { authenticate } from "@middleware/authMiddleware";

const router = new Hono();

// Logout User
router.patch("/", authenticate async (c) => {
  try {

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.error("Invalid token:", err.message);
      return c.text("Invalid token", 403);
    }

    const user = await UserModels.findByIdAndUpdate(
      userId,
      { token: null },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return c.text("User not found.", 404);
    }

    setCookie(c, "token", null, {
      httpOnly: true,
      path: "/",
      maxAge: 3600, // 1 hour
    });

    if (c.req.header("content-type") === "application/json") {
      return c.json({ message: "Logged out successfully" });
    } else {
      const html = await renderEJS("login", {
        title: "Home Page",
      });
      return c.html(html);
    }
  } catch (error) {
    console.error("Logout Error:", error);
    return c.text("Terjadi kesalahan saat logout.", 400);
  }
});

export default router;
