// Core React imports
import React, { useState, useMemo } from "react";

// Components
import ExpandableMenu from "@/components/menu/expendableMenu";
import MenuItem from "@/components/menu/menuItem";
import ContentRenderer from "@/components/nav/renderContents";
import Loading from "@/components/loading";

// State management
import useUserStore from "@/stores/user-store";

// Custom hooks
import { useRolePermissions } from "@/utils/permission";

// Animation library
import { motion } from "framer-motion";

// FontAwesome Icons
import {
  FaCrown,
  FaUserShield,
  FaUserTie,
  FaUserTag,
  FaUserAlt,
} from "react-icons/fa";

// Bootstrap Icons
import {
  BsFillShieldLockFill,
  BsShieldFillCheck,
  BsPersonLinesFill,
  BsPersonBadgeFill,
  BsPersonCircle,
} from "react-icons/bs";

// Material Design Icons
import {
  MdSupervisorAccount,
  MdAdminPanelSettings,
  MdManageAccounts,
  MdPointOfSale,
  MdPerson,
} from "react-icons/md";

// HeroIcons
import {
  HiShieldCheck,
  HiUserCircle,
  HiOfficeBuilding,
  HiCash,
  HiUser,
} from "react-icons/hi";

// Tabler Icons
import {
  TbUsersGroup,
  TbReportMoney,
  TbBox,
  TbCash,
  TbChevronDown,
  TbBuildingWarehouse,
  TbUserSquare,
  TbBuildingStore,
  TbShoppingCart,
  TbCategory,
  TbRuler,
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

const roleIcons = {
  fa: {
    Superadmin: FaCrown,
    Admin: FaUserShield,
    Manajer: FaUserTie,
    Kasir: FaUserTag,
    Default: FaUserAlt,
  },
  bs: {
    Superadmin: BsFillShieldLockFill,
    Admin: BsShieldFillCheck,
    Manajer: BsPersonLinesFill,
    Kasir: BsPersonBadgeFill,
    Default: BsPersonCircle,
  },
  md: {
    Superadmin: MdSupervisorAccount,
    Admin: MdAdminPanelSettings,
    Manajer: MdManageAccounts,
    Kasir: MdPointOfSale,
    Default: MdPerson,
  },
  hi: {
    Superadmin: HiShieldCheck,
    Admin: HiUserCircle,
    Manajer: HiOfficeBuilding,
    Kasir: HiCash,
    Default: HiUser,
  },
};

const styles = {
  Superadmin: "from-indigo-600 to-purple-600 border-indigo-900 neon-purple-500",
  Admin: "from-blue-600 to-cyan-600 border-blue-900 neon-blue-500",
  Manajer: "from-violet-600 to-fuchsia-600 border-violet-900 neon-fuchsia-500",
  Kasir: "from-emerald-600 to-teal-600 border-emerald-900 neon-emerald-500",
  Default: "from-slate-600 to-gray-600 border-slate-900 neon-gray-500",
};

const RoleIcon = ({ role, iconSet = "fa", size = 24 }) => {
  const Icon = roleIcons[iconSet]?.[role] || roleIcons[iconSet].Default;
  const neonClass = styles[role]?.split(" ")[2] || styles.Default.split(" ")[2];
  const colorMap = {
    purple: "168,85,247",
    blue: "59,130,246",
    fuchsia: "217,70,239",
    emerald: "16,185,129",
    gray: "107,114,128",
  };
  const color =
    Object.keys(colorMap).find((key) => neonClass.includes(key)) || "gray";

  return (
    <div
      className={`mr-4 text-${
        neonClass.split("-")[1]
      }-500 drop-shadow-[0_0_3px_rgba(${colorMap[color]},0.8)]`}
    >
      <Icon size={size} />
    </div>
  );
};

const Sidebar = () => {
  const { selectedLink, setSelectedLink, userData, isSidebarOpen } =
    useUserStore();
  const numericRole = userData.rule;
  const [expandedMenus, setExpandedMenus] = useState({});
  const rolePermissions = useRolePermissions();

  const roleMap = {
    1: "Superadmin",
    2: "Admin",
    3: "Manajer",
    4: "Kasir",
    5: "customer",
    null: "guest",
  };
  const userRole = roleMap[numericRole] || "guest";

  const menuConfig = useMemo(
    () => [
      { label: "Analisis", icon: TbChartLine, key: "analytics" },
      { label: "Report", icon: TbFileReport, key: "report" },
      { label: "Pembayaran", icon: TbCashBanknote, key: "payment" },
      { label: "Tipe", icon: TbTag, key: "type" },
      { label: "Perusahaan", icon: TbBuildings, key: "company" },
      { label: "Toko", icon: TbBuildingStore, key: "store" },
      {
        label: "Gudang",
        icon: TbChevronDown, // Changed to component, not JSX
        key: "gudang",
        submenu: [
          { label: "Persediaan", icon: TbBuildingWarehouse, key: "stock" },
          { label: "Pembelian", icon: TbShoppingCart, key: "pembelian" },
          { label: "Tabel Pembelian", icon: TbList, key: "pembelian_list" },
        ],
      },
      {
        label: "Sales",
        icon: TbChevronDown, // Changed to component, not JSX
        key: "sales",
        submenu: [
          { label: "Sales", icon: TbReportMoney, key: "sales" },
          { label: "Sales Promo", icon: TbDiscount, key: "sales_campaign" },
        ],
      },
      {
        label: "Product",
        icon: TbChevronDown, // Changed to component, not JSX
        key: "product",
        submenu: [
          { label: "Product", icon: TbBox, key: "product" },
          { label: "Category", icon: TbCategory, key: "category_product" },
          { label: "Promo", icon: TbDiscount, key: "item_campaign" },
          { label: "Varian", icon: TbSettings, key: "extras" },
          { label: "Ukuran", icon: TbRuler, key: "size" },
        ],
      },
      { label: "Pesanan Masuk", icon: TbTruckDelivery, key: "order_cust" },
      { label: "Order", icon: TbShoppingBag, key: "order" },
      { label: "Pengguna", icon: TbUsersGroup, key: "users" },
      { label: "Jabatan", icon: TbUserSquare, key: "rule_access" },
      { label: "Kasir UI", icon: TbCash, key: "kasir" },
    ],
    []
  );

  const filteredMenu = useMemo(
    () =>
      menuConfig
        .filter((item) => {
          if (item.key === "store" && !userData.id_company) return false;
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
            !userData.id_store
          )
            return false;
          return true;
        })
        .map((item) =>
          item.submenu
            ? {
                ...item,
                submenu: item.submenu.filter((sub) =>
                  rolePermissions[numericRole]?.includes(sub.key)
                ),
              }
            : item
        )
        .filter(
          (item) =>
            item?.submenu?.length > 0 ||
            rolePermissions[numericRole]?.includes(item.key)
        ),
    [
      userData.id_company,
      userData.id_store,
      numericRole,
      rolePermissions,
      menuConfig,
    ]
  );

  const toggleMenu = (key) =>
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  // Show loading if permissions aren't fetched yet or only "profile" is present
  if (
    !rolePermissions[numericRole] ||
    rolePermissions[numericRole].length <= 1
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      {/* <input id="my-drawer-2" type="checkbox" className="drawer-toggle" /> */}
      <input
        id="sidebar-drawer"
        type="checkbox"
        className={`${isSidebarOpen ? "drawer-toggle" : ""} hidden`}
      />
      <motion.div
        className="drawer-content flex flex-col overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ContentRenderer
          userRole={numericRole}
          filteredMenuConfig={filteredMenu}
        />
      </motion.div>
      <motion.div
        className="drawer-side z-20"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className={`top-20 menu w-80 pl-4 py-2 fixed z-50 bg-white shadow-lg rounded-xl bg-gradient-to-r ${
            styles[userRole] || styles.Default
          } text-white border-b-4`}
        >
          <span className="flex items-center text-2xl font-bold">
            <RoleIcon role={userRole} size={32} />
            {userRole}
          </span>
        </div>
        <ul className="menu bg-white mt-32 text-black min-h-full w-80 text-lg p-4 flex flex-col gap-2">
          {filteredMenu.map((item) =>
            item.submenu ? (
              <ExpandableMenu
                key={item.key}
                label={item.label}
                icon={item.icon}
                menuKey={item.key}
                expandedMenus={expandedMenus}
                toggleMenu={toggleMenu}
                isActive={item.submenu.some((sub) => sub.key === selectedLink)}
              >
                {item.submenu.map((sub) => (
                  <motion.li
                    key={sub.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MenuItem
                      icon={sub.icon}
                      label={sub.label}
                      onClick={() => setSelectedLink(sub.key)}
                      isActive={selectedLink === sub.key}
                    />
                  </motion.li>
                ))}
              </ExpandableMenu>
            ) : (
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
            )
          )}
        </ul>
      </motion.div>
    </div>
  );
};

export default Sidebar;
