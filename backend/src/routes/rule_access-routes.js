import { Hono } from "hono";
import { RuleAccessModels } from "@models/rule_access-models";
import { authenticate, OPERATIONS } from "@middleware/authMiddleware";

export const router = new Hono();

// Add rule
router.post(
  "/addrule",
  (c, next) => authenticate(c, next, "rule_access", OPERATIONS.CREATE),
  async (c) => {
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
  }
);

// List all rules
router.post(
  "/listrule",
  (c, next) => authenticate(c, next, "rule_access", OPERATIONS.READ),
  async (c) => {
    try {
      return c.json(await RuleAccessModels.find(), 200);
    } catch (error) {
      console.error("Error fetching rules:", error);
      return c.json(
        { error: "Internal Server Error", details: error.message },
        500
      );
    }
  }
);

// Get rule by ID
router.post(
  "/getrule",
  (c, next) => authenticate(c, next, "rule_access", OPERATIONS.READ),
  async (c) => {
    try {
      const { id } = await c.req.json();
      const rule = await RuleAccessModels.findById(id);
      return rule
        ? c.json(rule, 200)
        : c.json({ error: "Rule not found" }, 404);
    } catch (error) {
      console.error("Error fetching rule:", error);
      return c.json(
        { error: "Internal Server Error", details: error.message },
        500
      );
    }
  }
);

export default router;
