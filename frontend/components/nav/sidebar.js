import React, { useState, useEffect, useMemo } from "react";
import ExpandableMenu from "@/components/menu/expendableMenu";
import MenuItem from "@/components/menu/menuItem";
import { tokenDecoded } from "@/utils/tokenDecoded";
import ContentRenderer from "@/components/nav/renderContents";
import { rolePermissions } from "@/utils/permission";
import { motion } from "framer-motion";
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
  TbBuildingWarehouse,
  TbUserSquare,
  TbReport,
  TbBuildingStore,
  TbShoppingCart,
  TbCategory,
  TbRuler,
  TbReceiptTax,
  TbChartLine,
  TbList,
  TbTruckDelivery,
  TbBuildings,
  TbDiscount,
  TbCashBanknote,
  TbTag,
  TbFileReport,
  TbShoppingBag,
  TbSettings,
} from "react-icons/tb";

const Sidebar = ({ setSelectedLink, selectedLink }) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userRole, setUserRole] = useState("kasir");
  const [idCompany, setIdCompany] = useState(null);
  const [idStore, setIdStore] = useState(null);

  const toggleMenu = (menuKey) =>
    setExpandedMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));

  const roleMapping = {
    1: "superadmin",
    2: "admin",
    3: "manajer",
    4: "kasir",
    5: "customer",
  };

  useEffect(() => {
    const updateStateFromLocalStorage = () => {
      const userData = tokenDecoded();
      const numericRole = userData.rule;

      const id_company =
        localStorage.getItem("id_company") === "undefined"
          ? null
          : localStorage.getItem("id_company");
      const id_store =
        localStorage.getItem("id_store") === "undefined"
          ? null
          : localStorage.getItem("id_store");

      setIdCompany(id_company);
      setIdStore(id_store);

      const mappedRole = roleMapping[numericRole || ""] || "kasir";
      setUserRole(mappedRole);
    };

    // Jalankan langsung pertama kali
    updateStateFromLocalStorage();

    // Set interval untuk cek perubahan setiap 500ms
    const intervalId = setInterval(updateStateFromLocalStorage, 1000);

    return () => clearInterval(intervalId);
  }, []); // Run only once on component mount

  const menuConfig = [
    { label: "Analisis", icon: <TbChartLine />, key: "analytics" },
    { label: "Report", icon: <TbFileReport />, key: "report" },
    { label: "Pembayaran", icon: <TbCashBanknote />, key: "payment" },
    { label: "Tipe", icon: <TbTag />, key: "type" },
    { label: "Perusahaan", icon: <TbBuildings />, key: "company" },
    { label: "Toko", icon: <TbBuildingStore />, key: "store" },
    {
      label: "Gudang",
      icon: TbChevronDown,
      key: "gudang",
      submenu: [
        { label: "Persediaan", icon: <TbBuildingWarehouse />, key: "stock" },
        { label: "Pembelian", icon: <TbShoppingCart />, key: "pembelian" },
        {
          label: "Tabel Pembelian",
          icon: <TbList />,
          key: "pembelian_list",
        },
      ],
    },
    {
      label: "Sales",
      icon: TbChevronDown,
      key: "sales",
      submenu: [
        { label: "Sales", icon: <TbReportMoney />, key: "sales" },
        { label: "Sales Promo", icon: <TbDiscount />, key: "sales_campaign" },
      ],
    },

    {
      label: "Product",
      icon: TbChevronDown,
      key: "product",
      submenu: [
        { label: "Product", icon: <TbBox />, key: "product" },
        {
          label: "Category Product",
          icon: <TbCategory />,
          key: "category_product",
        },
        { label: "Product Promo", icon: <TbDiscount />, key: "item_campaign" },
        { label: "Varian", icon: <TbSettings />, key: "extras" },
        { label: "Ukuran", icon: <TbRuler />, key: "size" },
      ],
    },
    { label: "Pesanan Masuk", icon: <TbTruckDelivery />, key: "order_cust" },
    { label: "Order", icon: <TbShoppingBag />, key: "order" },
    { label: "Pengguna", icon: <TbUsersGroup />, key: "user" },
    { label: "Kasir UI", icon: <TbCash />, key: "kasir" },
  ];

  const filteredMenuConfig = useMemo(() => {
    return menuConfig
      .filter((item) => {
        if (["store"].includes(item.key) && !idCompany) {
          return false;
        }
        if (
          [
            "gudang",
            "analytics",
            "report",
            "product",
            "sales",
            "order_cust",
            "order",
            "kasir",
          ].includes(item.key) &&
          !idStore
        ) {
          return false; // Remove "Toko" if idStore is null
        }
        return true;
      })
      .map((item) => {
        if (item.submenu) {
          const filteredSubmenu = item.submenu.filter((subItem) =>
            rolePermissions[userRole]?.includes(subItem.key)
          );
          return filteredSubmenu.length > 0
            ? { ...item, submenu: filteredSubmenu }
            : null;
        }
        return rolePermissions[userRole]?.includes(item.key) ? item : null;
      })
      .filter(Boolean); // Remove null values
  }, [menuConfig, rolePermissions, userRole, idCompany, idStore]);

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <motion.div
        className="drawer-content flex flex-col items-center justify-center overflow-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden z-20 px-6 py-3 text-lg font-semibold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Open drawer
        </motion.label>
        <ContentRenderer
          selectedLink={selectedLink}
          setSelectedLink={setSelectedLink}
          userRole={userRole}
        />
      </motion.div>
      <motion.div
        className="drawer-side relative z-20"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div className="top-20 menu w-80 px-4 py-2 border-b-4 border-black fixed z-50 bg-white shadow-lg rounded-xl">
          <span className="flex items-center text-2xl font-bold">
            <TbUserSquare className="mr-4" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
        <ul className="menu bg-white mt-32 text-black min-h-full w-80 text-lg p-4 flex flex-col gap-2">
          {filteredMenuConfig.map((item) => {
            if (item.submenu) {
              return (
                <ExpandableMenu
                  key={item.key}
                  label={item.label}
                  icon={item.icon}
                  menuKey={item.key}
                  expandedMenus={expandedMenus}
                  toggleMenu={toggleMenu}
                  isActive={item.submenu.some(
                    (subItem) => subItem.key === selectedLink
                  )}
                >
                  {item.submenu.map((subItem) => (
                    <motion.li
                      key={subItem.key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MenuItem
                        icon={subItem.icon}
                        label={subItem.label}
                        onClick={() => setSelectedLink(subItem.key)}
                        isActive={selectedLink === subItem.key}
                        className="w-full"
                      />
                    </motion.li>
                  ))}
                </ExpandableMenu>
              );
            }
            return (
              <motion.li
                key={item.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <MenuItem
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setSelectedLink(item.key)}
                  isActive={selectedLink === item.key}
                />
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
};

export default Sidebar;
