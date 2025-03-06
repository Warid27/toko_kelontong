import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import ExpandableMenu from "@/components/menu/expendableMenu";
import MenuItem from "@/components/menu/menuItem";
import { tokenDecoded } from "@/utils/tokenDecoded";
import ContentRenderer from "@/components/nav/renderContents";
import { rolePermissions } from "@/utils/permission";
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
} from "react-icons/tb";

const Sidebar = () => {
  const [selectedLink, setSelectedLink] = useState("profile");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userRole, setUserRole] = useState("kasir");
  const [idCompany, setIdCompany] = useState(null);
  const [idStore, setIdStore] = useState(null);
  const router = useRouter();

  const toggleMenu = (menuKey) =>
    setExpandedMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));

  const handleLogout = () => {
    localStorage.clear(); // Removes all localStorage data
    router.push("/login");
  };

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
    { label: "Profile", icon: <TbUser />, key: "profile" },
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

    {
      label: "Product",
      icon: TbChevronDown,
      key: "product",
      submenu: [
        { label: "Product", icon: <TbBox />, key: "product" },
        { label: "Category Product", icon: <TbBox />, key: "category_product" },
        { label: "Product Promo", icon: <TbMoneybag />, key: "item_campaign" },
        { label: "Varian", icon: <TbShoppingBagPlus />, key: "extras" },
        { label: "Ukuran", icon: <TbPercentage />, key: "size" },
      ],
    },
    { label: "Pesanan Masuk", icon: <TbBox />, key: "order_cust" },
    { label: "Order", icon: <TbBox />, key: "order" },
    { label: "Pengguna", icon: <TbUsersGroup />, key: "user" },
    { label: "Kasir UI", icon: <TbBox />, key: "kasir" },
  ];

  const filteredMenuConfig = useMemo(() => {
    // INI LE
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
      <div className="drawer-content flex flex-col items-center justify-center overflow-auto">
        <label
          htmlFor="my-drawer-2"
          className="btn btn-primary drawer-button lg:hidden"
        >
          Open drawer
        </label>
        <ContentRenderer
          selectedLink={selectedLink}
          setSelectedLink={setSelectedLink}
          handleLogout={handleLogout}
          userRole={userRole}
        />
      </div>
      <div className="drawer-side relative">
        <div className="top-16 menu w-80 px-4 py-2 border-b-4 border-black fixed z-50 bg-white">
          <span className="flex items-center text-2xl font-bold ">
            <TbUserSquare className="mr-4" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>
        <ul className="menu bg-white mt-28 text-black min-h-full w-80 text-lg p-4 flex flex-col gap-1">
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
                    <MenuItem
                      key={subItem.key}
                      icon={subItem.icon}
                      label={subItem.label}
                      onClick={() => setSelectedLink(subItem.key)}
                      isActive={selectedLink === subItem.key}
                    />
                  ))}
                </ExpandableMenu>
              );
            }
            return (
              <li key={item.key}>
                <MenuItem
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setSelectedLink(item.key)}
                  isActive={selectedLink === item.key}
                />
              </li>
            );
          })}
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
