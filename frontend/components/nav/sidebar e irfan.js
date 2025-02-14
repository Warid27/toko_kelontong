import React, { useState, useEffect } from "react";
import { TbReportAnalytics } from "react-icons/tb";
import { BsBriefcaseFill } from "react-icons/bs";
import { IoIosLogOut } from "react-icons/io";
import { Analytics } from "@/pages/dashboard/sub/analytics";
//batas

import Sales_detail from "@/pages/dashboard/sub/sales_detail";
import Menu from "@/pages/dashboard/sub/menu";
import Extras from "@/pages/dashboard/sub/extras";
import Extras_Detail from "@/pages/dashboard/sub/extras_detail";
import Size from "@/pages/dashboard/sub/size";
import Size_detail from "@/pages/dashboard/sub/size_detail";
import Company from "@/pages/dashboard/sub/company";
import Store from "@/pages/dashboard/sub/store";
import Category_product from "@/pages/dashboard/sub/category_product";
import Sales from "@/pages/dashboard/sub/sales";
import Payment_name from "@/pages/dashboard/sub/payment_name";
import Payment_type from "@/pages/dashboard/sub/payment_type";
import Item_campaign from "@/pages/dashboard/sub/item_campaign";
import Sales_campaign from "@/pages/dashboard/sub/sales_campaign";
import Type from "@/pages/dashboard/sub/type";
import Table_cust from "@/pages/dashboard/sub/table_cust";
import Order_cust from "@/pages/dashboard/sub/order_cust";
import Order_cust_detail from "@/pages/dashboard/sub/order_cust_detail";
import Users from "@/pages/dashboard/sub/users";
// batas

import { useRouter } from "next/router";
import { FaBuilding } from "react-icons/fa";
import { HiOutlineBuildingStorefront } from "react-icons/hi2";
import { GiResize } from "react-icons/gi";
import { BsPatchPlus } from "react-icons/bs";
import { BsPatchPlusFill } from "react-icons/bs";
import { PiResizeFill } from "react-icons/pi";
import { TbCategoryPlus } from "react-icons/tb";
import { IoPeopleCircle } from "react-icons/io5";
import { IoPeopleCircleOutline } from "react-icons/io5";
import { MdPayment } from "react-icons/md";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";
import { BsCartPlus } from "react-icons/bs";
import { BsCartPlusFill } from "react-icons/bs";
import { BiSolidDiscount } from "react-icons/bi";
import { BsBuildingFillDown } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlinePayments } from "react-icons/md";
import { MdTableRestaurant } from "react-icons/md";

const Sidebar = () => {
  const [selectedMenu, setSelectedMenu] = useState("analytics");
  const router = useRouter();

  const [expandedMenus, setExpandedMenus] = useState({
    sales: false,
    extras: false,
    size: false,
    order_cust: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  }; // halo wak

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "analytics":
        return <Analytics />;
      case "menu":
        return <Menu />;
      case "extras":
        return <Extras />;
      case "extras_detail":
        return <Extras_Detail />;
      case "company":
        return <Company />;
      case "store":
        return <Store />;
      case "size":
        return <Size />;
      case "size_detail":
        return <Size_detail />;
      case "sales":
        return <Sales />;
      case "category_product":
        return <Category_product />;
      case "sales_detail":
        return <Sales_detail />;
      case "item_campaign":
        return <Item_campaign />;
      case "payment_name":
        return <Payment_name />;
      case "payment_type":
        return <Payment_type />;
      case "order_cust":
        return <Order_cust />;
      case "order_cust_detail":
        return <Order_cust_detail />;
      case "sales_campaign":
        return <Sales_campaign />;
      case "type":
        return <Type />;
      case "users":
        return <Users />;
      case "table_cust":
        return <Table_cust />;

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
          <li>
            <a onClick={() => setSelectedMenu("analytics")}>
              <TbReportAnalytics className="mr-2" />
              Analisis
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("payment_name")}>
              <MdPayment className="mr-2" />
              Nama Pembayaran
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("payment_type")}>
              <MdOutlinePayments className="mr-2" />
              Tipe Pembayaran
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("company")}>
              <FaBuilding className="mr-2" />
              Perusahaan
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("type")}>
              <BsBuildingFillDown className="mr-2" />
              Tipe
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("store")}>
              <HiOutlineBuildingStorefront className="mr-2" />
              Toko
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("menu")}>
              <BsBriefcaseFill className="mr-2" />
              Menu
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("category_product")}>
              <TbCategoryPlus className="mr-2" />
              Kategori Produk
            </a>
          </li>
          <li>
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <a
                onClick={() => setSelectedMenu("sales")}
                className="flex items-center flex-1"
              >
                <IoPeopleCircle className="mr-4" />
                Sales
              </a>
              {expandedMenus.sales ? (
                <IoMdArrowDropdown
                  className="w-7 h-7"
                  onClick={() => toggleMenu("sales")}
                />
              ) : (
                <IoMdArrowDropright
                  className="w-7 h-7"
                  onClick={() => toggleMenu("sales")}
                />
              )}
            </div>
            {expandedMenus.sales && (
              <a
                onClick={() => setSelectedMenu("sales_detail")}
                className="ml-7"
              >
                <IoPeopleCircleOutline className="mr-2" />
                Sales Detail
              </a>
            )}
            {expandedMenus.sales && (
              <a
                onClick={() => setSelectedMenu("sales_campaign")}
                className="ml-7"
              >
                <IoPeopleCircleOutline className="mr-2" />
                Sales Promo
              </a>
            )}
          </li>

          {/* Extras Menu */}
          <li>
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <a
                onClick={() => setSelectedMenu("extras")}
                className="flex items-center flex-1"
              >
                <BsPatchPlus className="mr-4" />
                Tambahan/Extras
              </a>
              {expandedMenus.extras ? (
                <IoMdArrowDropdown
                  className="w-7 h-7"
                  onClick={() => toggleMenu("extras")}
                />
              ) : (
                <IoMdArrowDropright
                  className="w-7 h-7"
                  onClick={() => toggleMenu("extras")}
                />
              )}
            </div>
            {expandedMenus.extras && (
              <a
                onClick={() => setSelectedMenu("extras_detail")}
                className="ml-7"
              >
                <BsPatchPlusFill className="mr-2" />
                Extras Detail
              </a>
            )}
          </li>

          {/* Size Menu */}
          <li>
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <a
                onClick={() => setSelectedMenu("size")}
                className="flex items-center flex-1"
              >
                <PiResizeFill className="mr-4" />
                Ukuran/Size
              </a>
              {expandedMenus.size ? (
                <IoMdArrowDropdown
                  className="w-7 h-7"
                  onClick={() => toggleMenu("size")}
                />
              ) : (
                <IoMdArrowDropright
                  className="w-7 h-7"
                  onClick={() => toggleMenu("size")}
                />
              )}
            </div>
            {expandedMenus.size && (
              <a
                onClick={() => setSelectedMenu("size_detail")}
                className="ml-7"
              >
                <GiResize className="mr-2" />
                Detail Ukuran
              </a>
            )}
          </li>

          {/* Order cust */}
          <li>
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <a
                onClick={() => setSelectedMenu("order_cust")}
                className="flex items-center flex-1"
              >
                <BsCartPlus className="mr-4" />
                Pemesanan
              </a>
              {expandedMenus.order_cust ? (
                <IoMdArrowDropdown
                  className="w-7 h-7"
                  onClick={() => toggleMenu("order_cust")}
                />
              ) : (
                <IoMdArrowDropright
                  className="w-7 h-7"
                  onClick={() => toggleMenu("order_cust")}
                />
              )}
            </div>
            {expandedMenus.order_cust && (
              <a
                onClick={() => setSelectedMenu("order_cust_detail")}
                className="ml-7"
              >
                <BsCartPlusFill className="mr-2" />
                Detail Pemesanan
              </a>
            )}
          </li>

          <li>
            <a onClick={() => setSelectedMenu("item_campaign")}>
              <BiSolidDiscount className="mr-2" />
              Promo Produk
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("users")}>
              <FaUserCircle className="mr-2" />
              Pengguna
            </a>
          </li>
          <li>
            <a onClick={() => setSelectedMenu("table_cust")}>
              <MdTableRestaurant className="mr-2" />
              Meja Customer
            </a>
          </li>

          <li>
            <a onClick={handleLogout}>
              <IoIosLogOut className="mr-2" />
              Log Out
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
