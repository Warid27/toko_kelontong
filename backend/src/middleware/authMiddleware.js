// authMiddleware.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/config";

// Middleware to verify the token
export const authenticate = async (c, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized: Missing or invalid token" }, 401);
    }

    const token = authHeader.split(" ")[1]; // Extract the token after "Bearer "

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the decoded user information to the context
    c.set("user", decoded);

    // Proceed to the next middleware or route handler
    await next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return c.json({ message: "Unauthorized: Invalid token" }, 401);
  }
};
