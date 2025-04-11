import React, { useState, useEffect, useMemo } from "react";
import ExpandableMenu from "@/components/menu/expendableMenu";
import MenuItem from "@/components/menu/menuItem";
import { tokenDecoded } from "@/utils/tokenDecoded";
import { rolePermissions } from "@/utils/permission";
import { motion } from "framer-motion";
import {
  TbReportAnalytics,
  TbBuilding,
  TbAdjustments,
  TbUserSquare,
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

    updateStateFromLocalStorage();
    const intervalId = setInterval(updateStateFromLocalStorage, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const menuConfig = [
    { label: "Analisis", icon: <TbReportAnalytics />, key: "analytics" },
    { label: "Report", icon: <TbReportAnalytics />, key: "report" },
    { label: "Pembayaran", icon: <TbCash />, key: "payment" },
    { label: "Tipe", icon: <TbBuilding />, key: "type" },
    { label: "Perusahaan", icon: <TbBuilding />, key: "company" },
    { label: "Toko", icon: <TbBuilding />, key: "store" },
    {
      label: "Gudang",
      icon: TbChevronDown,
      key: "gudang",
      submenu: [
        { label: "Persediaan", icon: <TbBuildingWarehouse />, key: "stock" },
        { label: "Pembelian", icon: <TbBuildingWarehouse />, key: "pembelian" },
        {
          label: "Tabel Pembelian",
          icon: <TbBriefcase />,
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
        { label: "Sales Promo", icon: <TbMoneybag />, key: "sales_campaign" },
      ],
    },
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
      .filter(Boolean);
  }, [menuConfig, rolePermissions, userRole, idCompany, idStore]);

  return (
    <motion.div
      className="fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-lg shadow-2xl border-r border-white/20 text-white p-4 flex flex-col"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 text-xl font-semibold mb-6">
        <TbUserSquare className="text-3xl text-white" />
        <span>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
      </div>

      {/* Menu */}
      <ul className="space-y-2">
        {filteredMenuConfig.map((item) =>
          item.submenu ? (
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
                <MenuItem
                  key={subItem.key}
                  icon={subItem.icon}
                  label={subItem.label}
                  onClick={() => setSelectedLink(subItem.key)}
                  isActive={selectedLink === subItem.key}
                />
              ))}
            </ExpandableMenu>
          ) : (
            <li key={item.key}>
              <MenuItem
                icon={item.icon}
                label={item.label}
                onClick={() => setSelectedLink(item.key)}
                isActive={selectedLink === item.key}
              />
            </li>
          )
        )}
      </ul>
    </motion.div>
  );
};

export default Sidebar;
