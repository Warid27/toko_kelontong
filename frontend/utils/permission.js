import { fetchRuleList } from "@/libs/fetching/rule";
import { useState, useEffect } from "react";

const pageAccess = {
  all: "profile",
  sales: ["analytics", "sales", "report"],
  payment: "payment",
  company: "company",
  store: "store",
  sales_campaign: "sales_campaign",
  product: "product",
  item_campaign: "item_campaign",
  extras: "extras",
  size: "size",
  order_cust: "order_cust",
  order: ["order", "kasir"],
  users: "users",
  type: "type",
  stock: "stock",
  pembelian: ["pembelian", "pembelian_list"],
  category_product: "category_product",
  rule_access: "rule_access",
};

export const useRolePermissions = () => {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const loadPermissions = async () => {
      const rules = await fetchRuleList();
      const rolePerms = {};

      rules.forEach(({ rule, table_name, can_read }) => {
        if (!rolePerms[rule]) rolePerms[rule] = new Set([pageAccess.all]);

        const superadminTables = ["rule_access", "company"];

        // Skip adding for restricted tables if role is not 1 (Superadmin)
        if (superadminTables.includes(table_name) && rule != 1) {
          return;
        }

        if (can_read) {
          const pages = Array.isArray(pageAccess[table_name])
            ? pageAccess[table_name]
            : [pageAccess[table_name]].filter(Boolean);
          pages.forEach((page) => rolePerms[rule].add(page));
        }
      });

      setPermissions(
        Object.fromEntries(
          Object.entries(rolePerms).map(([role, pages]) => [role, [...pages]])
        )
      );
    };

    loadPermissions();
  }, []);

  return permissions;
};
