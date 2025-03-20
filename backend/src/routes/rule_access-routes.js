import { Hono } from "hono";
import { RuleAccessModels } from "@models/rule_access-models";
import { authenticate } from "@middleware/authMiddleware";

export const router = new Hono();

// Add rule
router.post("/addrule", authenticate, async (c) => {
  try {
    const rule = new RuleAccessModels(await c.req.json());
    await rule.save();
    return c.json(rule, 201);
  } catch (error) {
    console.error("Error saving rule:", error);
    return c.json(
      { error: "Something went wrong", details: error.message },
      500
    );
  }
});

// List all rules
router.post("/listrule", authenticate, async (c) => {
  try {
    return c.json(await RuleAccessModels.find(), 200);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});

// Get rule by ID
router.post("/getrule", authenticate, async (c) => {
  try {
    const { id } = await c.req.json();
    const rule = await RuleAccessModels.findById(id);
    return rule ? c.json(rule, 200) : c.json({ error: "Rule not found" }, 404);
  } catch (error) {
    console.error("Error fetching rule:", error);
    return c.json(
      { error: "Internal Server Error", details: error.message },
      500
    );
  }
});

export default router;
