import { Hono } from "hono";
import { UserModels } from "@models/user-models";

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

// Login Route
router.post("/", async (c) => {
  try {
    // Parse request body
    const { username, password, error } = await parseRequestBody(c);
    if (error) {
      return c.json({ message: error }, 400); // Bad Request
    }

    // Find user in the database
    const user = await UserModels.findOne({ username });
    if (!user) {
      return c.json({ message: "Wrong username or password" }, 401); // Unauthorized
    }

    // Compare password (plain text)
    const isPasswordMatch = password === user.password;
    if (!isPasswordMatch) {
      return c.json({ message: "Wrong username or password" }, 401); // Unauthorized
    }

    // Generate a simple token (for demonstration purposes)
    const token = `simple-token-${Math.random().toString(36).substring(7)}`;

    // Return success response
    return c.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        id_store: user.id_store,
        id_company: user.id_company,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return c.json({ message: "An error occurred", error: error.message }, 500); // Internal Server Error
  }
});

export default router;
