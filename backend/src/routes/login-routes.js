import { Hono } from "hono";
import { JWT_SECRET } from "@config/config";
import { UserModels } from "@models/user-models";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const router = new Hono();

// Helper function to parse request body
const parseRequestBody = async (c) => {
  try {
    let username, password;
    // Check if the request is JSON
    if (
      c.req.header("accept") === "application/json" ||
      c.req.header("Content-Type") === "application/json"
    ) {
      const body = await c.req.json();
      username = body.username;
      password = body.password;
    } else {
      // Parse URL-encoded body
      const rawBody = await c.req.text();
      const parsedBody = new URLSearchParams(rawBody);
      username = parsedBody.get("username");
      password = parsedBody.get("password");
    }
    // Validate required fields
    if (!username || !password) {
      return { error: "Username and password are required" };
    }
    return { username, password };
  } catch (error) {
    console.error("Error parsing request body:", error.message);
    return { error: "Invalid request body" };
  }
};

router.post("/", async (c) => {
  try {
    // Parse request body
    const { username, password, error } = await parseRequestBody(c);
    if (error) {
      return c.json({ message: error }, 400); // Bad Request
    }

    // Find user in the database, including the 'status' field
    const user = await UserModels.findOne({ username }).select(
      "+password +status"
    ); // Ensure 'password' and 'status' are included
    if (!user || !(await argon2.verify(user.password, password))) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    // Verify password using Argon2
    const isPasswordMatch = await argon2.verify(user.password, password);
    if (!isPasswordMatch) {
      return c.json({ message: "Wrong username or password" }, 401); // Unauthorized
    }

    // Check if the user's account is activated (status === 0)
    if (user.status !== 0) {
      return c.json(
        {
          message: "Login failed, user account not activated",
        },
        403
      ); // Forbidden
    }
    // Generate a JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        id_store: user.id_store,
        id_company: user.id_company,
        rule: user.rule,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Return success response
    return c.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          id_store: user.id_store,
          id_company: user.id_company,
          rule: user.rule,
        },
      },
      200
    );
  } catch (error) {
    console.error("Login Error:", error.message);
    return c.json({ message: "An error occurred", error: error.message }, 500); // Internal Server Error
  }
});

export default router;
