import React from "react";
import { useRolePermissions } from "@/utils/permission";
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

const ContentRenderer = ({
  selectedLink,
  setSelectedLink,
  userRole,
  filteredMenuConfig,
  userData,
}) => {
  const rolePermissions = useRolePermissions();
  const allowedKeys = filteredMenuConfig
    .flatMap((item) =>
      item?.submenu ? item.submenu.map((sub) => sub?.key) : item?.key
    )
    .filter(Boolean);

  // Show loading if permissions aren't fetched yet or only "profile" is present
  if (!rolePermissions[userRole] || rolePermissions[userRole].length <= 1) {
    return <div className="p-4 text-3xl text-gray-500">Loading...</div>;
  }

  const hasPermission =
    selectedLink === "profile"
      ? rolePermissions[userRole].includes(selectedLink)
      : allowedKeys.includes(selectedLink) &&
        rolePermissions[userRole].includes(selectedLink);

  if (!hasPermission) {
    return <div className="p-4 text-3xl text-red-500">Access Denied</div>;
  }

  const components = {
    company: CompanyData,
    stock: StockList,
    pembelian: Pembelian,
    type: TypeList,
    category_product: CategoryProduct,
    store: StoreData,
    analytics: Analytics,
    report: Report,
    product: ProductMenu,
    extras: Extras,
    users: User,
    order: Order,
    order_cust: OrderCust,
    size: Size,
    profile: Profile,
    payment: Payment,
    pembelian_list: PembelianList,
    sales_campaign: SalesCampaign,
    item_campaign: ItemCampaign,
    sales: SalesMain,
    kasir: Kasir,
    rule_access: RuleAccessData,
  };

  const Component = components[selectedLink] || Profile;
  return (
    <Component
      {...(selectedLink === "order_cust"
        ? { setSelectedLink, userData }
        : { userData })}
    />
  );
};

export default ContentRenderer;
