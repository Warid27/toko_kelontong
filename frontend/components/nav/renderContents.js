import React from "react";
import Analytics from "@/pages/dashboard/sub/analytics";
import ProductMenu from "@/pages/dashboard/sub/menu";
import CompanyData from "@/pages/dashboard/sub/company";
import SalesCampaign from "@/pages/dashboard/sub/salesCampaign";
import StoreData from "@/pages/dashboard/sub/store";
import Extras from "@/pages/dashboard/sub/extras";
import User from "@/pages/dashboard/sub/users";
import Size from "@/pages/dashboard/sub/size";
import Kasir from "@/pages/dashboard/sub/kasir";
import Order from "@/pages/dashboard/sub/order";
import OrderCust from "@/pages/dashboard/sub/order_cust";
import Profile from "@/pages/dashboard/sub/profile";
import Payment from "@/pages/dashboard/sub/payment";
import SalesMain from "@/pages/dashboard/sub/sales";
import ItemCampaign from "@/pages/dashboard/sub/itemCampaign";
import TypeList from "@/pages/dashboard/sub/typeList";
import CategoryProduct from "@/pages/dashboard/sub/categoryProduct";
import StockList from "@/pages/dashboard/sub/stock";
import PembelianList from "@/pages/dashboard/sub/table_pembelian";
import Pembelian from "@/pages/dashboard/sub/pembelian";
import Report from "@/pages/dashboard/sub/report";
import RuleAccessData from "@/pages/dashboard/sub/rule";
import { rolePermissions } from "@/utils/permission";

const ContentRenderer = ({
  selectedLink,
  setSelectedLink,
  userRole,
  filteredMenuConfig,
}) => {
  // Flatten the filteredMenuConfig to include both top-level items and submenu items
  const allowedKeys = filteredMenuConfig.flatMap((item) =>
    item.submenu ? item.submenu.map((subItem) => subItem.key) : item.key
  );

  // Check permissions
  const hasMenuPermission = allowedKeys.includes(selectedLink);
  const hasRolePermission =
    rolePermissions[userRole]?.includes(selectedLink) || false;

  // Special case for "profile": only requires role permission, not menu permission
  const hasPermission =
    selectedLink === "profile"
      ? hasRolePermission
      : hasMenuPermission && hasRolePermission;

  if (!hasPermission) {
    return <div className="text-red-500 p-4 text-3xl">Access Denied</div>;
  }

  switch (selectedLink) {
    case "company":
      return <CompanyData />;
    case "stock":
      return <StockList />;
    case "pembelian":
      return <Pembelian />;
    case "type":
      return <TypeList />;
    case "category_product":
      return <CategoryProduct />;
    case "store":
      return <StoreData />;
    case "analytics":
      return <Analytics />;
    case "report":
      return <Report />;
    case "product":
      return <ProductMenu />;
    case "extras":
      return <Extras />;
    case "user":
      return <User />;
    case "order":
      return <Order />;
    case "order_cust":
      return <OrderCust setSelectedLink={setSelectedLink} />;
    case "size":
      return <Size />;
    case "profile":
      return <Profile />;
    case "payment":
      return <Payment />;
    case "pembelian_list":
      return <PembelianList />;
    case "sales_campaign":
      return <SalesCampaign />;
    case "item_campaign":
      return <ItemCampaign />;
    case "sales":
      return <SalesMain />;
    case "kasir":
      return <Kasir />;
    case "rule":
      return <RuleAccessData />;
    default:
      return <Analytics />;
  }
};

export default ContentRenderer;
