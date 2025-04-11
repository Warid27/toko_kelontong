// authMiddleware.js
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@config/config";
import { RuleAccessModels } from "@models/rule_access-models";

// Constants for operations (moved from roleMiddleware)
export const OPERATIONS = {
  CREATE: "can_create",
  READ: "can_read",
  UPDATE: "can_update",
  DELETE: "can_delete",
};

/**
 * Middleware to verify token and optionally check permissions
 * @param {string} [tableName] - Optional table name for permission checking
 * @param {string} [operation] - Optional operation to check
 */
export const authenticate = async (
  c,
  next,
  tableName = null,
  operation = null
) => {
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

    // If no tableName or operation provided, just authenticate and proceed
    if (!tableName || !operation) {
      await next();
      return;
    }

    // Get the user's role from decoded token
    const userRole = decoded.rule;

    // If user is Superadmin (rule = 1), allow all operations
    if (userRole === 1) {
      await next();
      return;
    }

    // Find the access rule for this user role and table
    const accessRule = await RuleAccessModels.findOne({
      rule: userRole,
      table_name: tableName,
    });

    // If no access rule found or the specific operation is not allowed
    if (!accessRule || accessRule[operation] !== 1) {
      return c.json(
        {
          message: `Permission denied: You don't have ${operation} access to ${tableName}`,
        },
        403
      );
    }

    // User has permission, proceed to the next middleware or route handler
    await next();
  } catch (error) {
    console.error("Authentication/Authorization failed:", error.message);
    if (error.name === "JsonWebTokenError") {
      return c.json({ message: "Unauthorized: Invalid token" }, 401);
    }
    return c.json(
      { message: "Internal server error during authentication" },
      500
    );
  }
};
