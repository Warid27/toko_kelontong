import { Hono } from "hono";
import { setCookie, getCookie } from "hono/cookie";
import { PORT, SECRET_KEY } from "@config/config";
import { UserModels } from "@models/user-models";
import jwt from "jsonwebtoken";
import accessValidation from "@validation/user-validation";
import { renderEJS } from "@config/config";

const router = new Hono();

// Logout User
router.patch("/", async (c) => {
  try {
    let token = getCookie(c, "token");

    if (!token) {
      const authHeader = c.req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    console.log("Token from request:", token);

    if (!token) {
      return c.text("No token found", 401);
    }

    let userId;
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
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
