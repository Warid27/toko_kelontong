import { Schema, model } from "mongoose";

const ruleAccessSchema = new Schema({
  rule: {
    type: Number,
    enum: [0, 1, 2, 3, 4, 5], // (Not Set, Superadmin, Admin, Manager, Cashier, Customer)
    default: 0,
  },
  table_name: {
    type: String,
    required: true,
    index: true,
  },
  can_create: {
    type: Number,
    enum: [0, 1], // 0 (false) or 1 (true)
    default: 0,
  },
  can_read: {
    type: Number,
    enum: [0, 1], // 0 (false) or 1 (true)
    default: 0,
  },
  can_update: {
    type: Number,
    enum: [0, 1], // 0 (false) or 1 (true)
    default: 0,
  },
  can_delete: {
    type: Number,
    enum: [0, 1], // 0 (false) or 1 (true)
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const RuleAccessModel = model(
  "rule_access",
  ruleAccessSchema,
  "rule_access"
);
