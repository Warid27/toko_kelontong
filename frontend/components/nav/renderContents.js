// ContentRenderer.jsx
import React from "react";
import Analytics from "@/pages/dashboard/sub/analytics";
import Menu from "@/pages/dashboard/sub/menu";
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
import Pembelian from "@/pages/dashboard/sub/pembelian";
import { rolePermissions } from "@/utils/permission";

const ContentRenderer = ({
  selectedLink,
  setSelectedLink,
  handleLogout,
  userRole,
}) => {
  // Check if the user has permission to access the selectedLink
  const hasPermission = rolePermissions[userRole]?.includes(selectedLink);

  if (!hasPermission) {
    return <div className="text-red-500 p-4">Access Denied</div>;
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
    case "product":
      return <Menu />;
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
    case "sales_campaign":
      return <SalesCampaign />;
    case "item_campaign":
      return <ItemCampaign />;
    case "sales":
      return <SalesMain />;
    case "kasir":
      return <Kasir />;
    case "logout":
      handleLogout();
      return null;
    default:
      return <Analytics />;
  }
};

export default ContentRenderer;
