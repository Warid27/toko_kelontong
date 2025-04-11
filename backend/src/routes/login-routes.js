import { Hono } from "hono";
import { JWT_SECRET } from "@config/config";
import { UserModels } from "@models/user-models";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

const router = new Hono();

// Helper function to parse request body
const parseRequestBody = async (c) => {
  try {
    const body = await c.req.json();
    const username = body.username;
    const password = body.password;

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

    // Check if the user's account is not inactive
    if (![0, 1].includes(user.status)) {
      return c.json(
        {
          message: "Login failed, user account is not available!!!",
        },
        403
      ); // Forbidden
    }

    // Configure JWT options based on user.rule
    const tokenOptions = {};
    if (user.rule !== 5) {
      tokenOptions.expiresIn = "1h"; // Set expiration only if rule is not 5
    }

    // Generate a JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        id_store: user.id_store,
        id_company: user.id_company,
        rule: user.rule,
        status: user.status,
      },
      JWT_SECRET,
      tokenOptions // Use conditional options
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

// The /checkpass route remains unchanged
router.post(
  "/checkpass",
  (c, next) => authenticate(c, next, "users", OPERATIONS.READ),
  async (c) => {
    try {
      const { username, password, error } = await parseRequestBody(c);
      if (error) {
        return c.json({ message: error }, 400);
      }

      const user = await UserModels.findOne({ username }).select(
        "+password +status"
      );
      if (!user || !(await argon2.verify(user.password, password))) {
        return c.json({ message: "Invalid credentials" }, 401);
      }

      const isPasswordMatch = await argon2.verify(user.password, password);
      if (!isPasswordMatch) {
        return c.json({ message: "Wrong password!" }, 401);
      }

      if (user.status !== 0 && user.status !== 1) {
        return c.json(
          {
            message: "Login failed, user account not activated",
          },
          403
        );
      }

      return c.json(
        {
          message: "password correct",
        },
        200
      );
    } catch (error) {
      return c.json(
        { message: "An error occurred", error: error.message },
        500
      );
    }
  }
);

export default router;
