import React, { useState } from "react";
import { useRouter } from "next/router";
import ExpandableMenu from "@/components/menu/expendableMenu";
import MenuItem from "@/components/menu/menuItem";
// Icons
import {
  TbReportAnalytics,
  TbBuilding,
  TbAdjustments,
  TbUser,
  TbUsersGroup,
  TbBriefcase,
  TbShoppingBagPlus,
  TbLogout,
  TbReportMoney,
  TbBox,
  TbPercentage,
  TbWallet,
  TbCash,
  TbMoneybag,
  TbChevronDown,
} from "react-icons/tb";
// Sub Pages
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
import Profile from "@/pages/dashboard/sub/profile";
import Payment from "@/pages/dashboard/sub/payment";
import SalesMain from "@/pages/dashboard/sub/sales";

const Sidebar = () => {
  const [selectedLink, setSelectedLink] = useState("profile");
  const [expandedMenus, setExpandedMenus] = useState({
    sales: false,
    product: false,
  });
  const router = useRouter();

  // Toggle submenu expansion
  const toggleMenu = (menu) =>
    setExpandedMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Render content based on selected link
  const renderContent = () => {
    switch (selectedLink) {
      case "company":
        return <CompanyData />;
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
      case "size":
        return <Size />;
      case "profile":
        return <Profile />;
      case "payment":
        return <Payment />;
      case "sales_campaign":
        return <SalesCampaign />;
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

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-center justify-center">
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden"
        >
          Open drawer
        </label>
        {renderContent()}
      </div>
      <div className="drawer-side">
        <ul className="menu bg-white mt-16 text-black min-h-full w-80 text-lg p-4">
          {/* Profile */}
          <li>
            <MenuItem
              icon={<TbUser />}
              label="Profile"
              onClick={() => setSelectedLink("profile")}
            />
          </li>
          {/* Analytics */}
          <li>
            <MenuItem
              icon={<TbReportAnalytics />}
              label="Analisis"
              onClick={() => setSelectedLink("analytics")}
            />
          </li>
          {/* Payments */}
          <li>
            <MenuItem
              icon={<TbCash />}
              label="Pembayaran"
              onClick={() => setSelectedLink("payment")}
            />
          </li>
          {/* Company */}
          <li>
            <MenuItem
              icon={<TbBuilding />}
              label="Perusahaan"
              onClick={() => setSelectedLink("company")}
            />
          </li>
          {/* Store */}
          <li>
            <MenuItem
              icon={<TbBuilding />}
              label="Toko"
              onClick={() => setSelectedLink("store")}
            />
          </li>
          {/* Sales Menu */}
          <ExpandableMenu
            label="Sales"
            icon={TbChevronDown}
            menuKey="sales"
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
          >
            <MenuItem
              icon={<TbReportMoney />}
              label="Sales"
              onClick={() => setSelectedLink("sales")}
            />
            <MenuItem
              icon={<TbMoneybag />}
              label="Sales Promo"
              onClick={() => setSelectedLink("sales_campaign")}
            />
          </ExpandableMenu>
          {/* Product Menu */}
          <ExpandableMenu
            label="Product"
            icon={TbChevronDown}
            menuKey="product"
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
          >
            <MenuItem
              icon={<TbBox />}
              label="Product"
              onClick={() => setSelectedLink("product")}
            />
            <MenuItem
              icon={<TbMoneybag />}
              label="Product Promo"
              onClick={() => setSelectedLink("product_campaign")}
            />
          </ExpandableMenu>
          {/* Orders */}
          <li>
            <MenuItem
              icon={<TbBox />}
              label="Order"
              onClick={() => setSelectedLink("order")}
            />
          </li>
          {/* Users */}
          <li>
            <MenuItem
              icon={<TbUsersGroup />}
              label="Pengguna"
              onClick={() => setSelectedLink("user")}
            />
          </li>
          {/* Kasir */}
          <li>
            <MenuItem
              icon={<TbBox />}
              label="Kasir UI"
              onClick={() => setSelectedLink("kasir")}
            />
          </li>
          {/* Logout */}
          <li>
            <a
              onClick={handleLogout}
              className="text-red-500 flex items-center"
            >
              <TbLogout className="mr-2" />
              Log Out
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
