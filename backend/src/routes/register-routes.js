import { Hono } from "hono";
import { UserModels } from "@models/user-models";
import { CompanyModels } from "@models/company-models";
import { StoreModels } from "@models/store-models";
import argon2 from "argon2";

const router = new Hono();

// Hash a password
async function hashPassword(password) {
  return await argon2.hash(password);
}

// Parse request body to extract username, password, and other fields
const parseRequestBody = async (c) => {
  try {
    const body = await c.req.json();

    const username = body.username;
    const password = body.password;
    const id_company = body.id_company || null; // Set to null if not provided
    const id_store = body.id_store || null; // Set to null if not provided
    const status = body.status !== undefined ? body.status : 1; // Set to 1 if not provided
    const rule = body.rule || null; // Set to null if not provided

    // Validate required fields
    if (!username || !password) {
      return { error: "Missing required fields: username or password" };
    }

    return { username, password, id_company, id_store, status, rule };
  } catch (error) {
    console.error("Error parsing request body:", error.message);
    return { error: "Invalid request body" };
  }
};

// REGISTER USER
router.post("/", async (c) => {
  try {
    const { username, password, id_company, id_store, status, rule, error } =
      await parseRequestBody(c);
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

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user in the database
    const userData = await UserModels.create({
      username,
      password: hashedPassword,
      rule: rule,
      status: status,
      id_company: id_company, 
      id_store: id_store,
    });

    return c.json({
      message: "User registered successfully",
      user: {
        id: userData.id,
        username: userData.username,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    return c.json({ message: "An error occurred", error: error.message }, 500);
  }
});

export default router;
