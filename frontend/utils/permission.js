export const rolePermissions = {
  superadmin: [
    "profile",
    "analytics",
    "payment",
    "company",
    "store",
    "sales",
    "sales_campaign",
    "product",
    "item_campaign",
    "extras",
    "size",
    "order_cust",
    "order",
    "user",
    "kasir",
    "type",
    "stock",
    "pembelian",
    "category_product",
  ],
  admin: [
    "profile",
    "analytics",
    "payment",
    "sales",
    "sales_campaign",
    "product",
    "item_campaign",
    "extras",
    "size",
    "order_cust",
    "order",
    "stock",
    "pembelian",
    "type",
  ],
  manajer: [
    "profile",
    "analytics",
    "payment",
    "sales",
    "sales_campaign",
    "product",
    "item_campaign",
    "extras",
    "size",
    "order_cust",
    "order",
  ],
  kasir: ["profile", "order_cust", "sales", "stock", "kasir"],
};
