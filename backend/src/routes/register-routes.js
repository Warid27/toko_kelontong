import { Hono } from "hono";
import { UserModels } from "@models/user-models";

const router = new Hono();

// Parse request body to extract username and password
const parseRequestBody = async (c) => {
  try {
    let username, password;

    // Log the raw request body
    const rawBody = await c.req.text();
    console.log("Raw Request Body:", rawBody);

    // Check if the request is JSON
    if (c.req.header("Content-Type") === "application/json") {
      const body = JSON.parse(rawBody); // Parse JSON manually
      console.log("Parsed JSON Body:", body);
      username = body.username;
      password = body.password;
    } else {
      // Parse URL-encoded body
      const parsedBody = new URLSearchParams(rawBody);
      console.log("Parsed URL-Encoded Body:", Object.fromEntries(parsedBody));
      username = parsedBody.get("username");
      password = parsedBody.get("password");
    }

    // Validate required fields
    if (!username || !password) {
      return { error: "Missing required fields: username or password" };
    }

    return { username, password };
  } catch (error) {
    console.error("Error parsing request body:", error.message);
    return { error: "Invalid request body" };
  }
};

// Register User
router.post("/", async (c) => {
  try {
    // Parse request body
    const { username, password, error } = await parseRequestBody(c);
    if (error) {
      return c.json({ message: error }, 400); // Bad Request
    }

    // Check if the user already exists
    const existingUser = await UserModels.findOne({ username });
    if (existingUser) {
      return c.json(
        { message: "User already exists. Please choose a different username." },
        409
      ); // Conflict
    }

    // Hardcoded values
    const rule = null;
    const status = 1; // Inactive
    const id_company = null; // Example company ID
    const id_store = null; // Example store ID

    // Create the user in the database
    const userData = await UserModels.create({
      username,
      password,
      rule,
      status,
      id_company,
      id_store,
    });

    // Return response based on request type
    if (c.req.header("Content-Type") === "application/json") {
      return c.json({
        message: "User registered successfully",
        user: userData,
      });
    } else {
      return c.redirect("/login"); // Redirect for non-JSON requests
    }
  } catch (error) {
    console.error("Error registering user:", error.message);
    return c.json({ message: "An error occurred", error: error.message }, 500); // Internal Server Error
  }
});

export default router;
