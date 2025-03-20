import React, { useState, useMemo } from "react";
import ExpandableMenu from "@/components/menu/expendableMenu";
import MenuItem from "@/components/menu/menuItem";
import ContentRenderer from "@/components/nav/renderContents";
import { rolePermissions } from "@/utils/permission";
import { motion } from "framer-motion";
// MUTU YUD EROR E  ER CE TE I
import {
  FaCrown,
  FaUserShield,
  FaUserTie,
  FaUserCog,
  FaUserAlt,
  FaUserTag,
  FaUserCheck,
  FaUserClock,
} from "react-icons/fa";
import {
  BsShieldFillCheck,
  BsFillShieldLockFill,
  BsPersonLinesFill,
  BsPersonBadgeFill,
  BsPersonCircle,
} from "react-icons/bs";
import {
  MdSupervisorAccount,
  MdAdminPanelSettings,
  MdManageAccounts,
  MdPerson,
  MdPointOfSale,
} from "react-icons/md";
import {
  HiUserCircle,
  HiShieldCheck,
  HiOfficeBuilding,
  HiCash,
  HiUser,
} from "react-icons/hi";
// import { TbUserSquare, TbCrown, TbShield, TbBuildingStore, TbCashBanknote } from 'react-icons/tb';
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

const roleIconsMapping = {
  // Font Awesome Icons (react-icons/fa)
  fa: {
    Superadmin: FaCrown,
    Admin: FaUserShield,
    Manajer: FaUserTie,
    Kasir: FaUserTag,
    Default: FaUserAlt,
  },

  // Bootstrap Icons (react-icons/bs)
  bs: {
    Superadmin: BsFillShieldLockFill,
    Admin: BsShieldFillCheck,
    Manajer: BsPersonLinesFill,
    Kasir: BsPersonBadgeFill,
    Default: BsPersonCircle,
  },

  // Material Design Icons (react-icons/md)
  md: {
    Superadmin: MdSupervisorAccount,
    Admin: MdAdminPanelSettings,
    Manajer: MdManageAccounts,
    Kasir: MdPointOfSale,
    Default: MdPerson,
  },

  // Heroicons (react-icons/hi)
  hi: {
    Superadmin: HiShieldCheck,
    Admin: HiUserCircle,
    Manajer: HiOfficeBuilding,
    Kasir: HiCash,
    Default: HiUser,
  },
};

const FuturisticRoleIcon = ({
  role,
  iconSet = "fa",
  size = 24,
  styleType = "gradient",
}) => {
  const IconSet = roleIconsMapping[iconSet] || roleIconsMapping.fa;
  const Icon = IconSet[role] || IconSet.Default;

  const colorStyles = {
    Superadmin: {
      gradient:
        "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600",
      neon: "text-purple-500 drop-shadow-[0_0_3px_rgba(168,85,247,0.8)]",
      modern: "text-indigo-700",
      cyberpunk: "text-purple-500 border-2 border-purple-500 p-1 rounded-md",
    },
    Admin: {
      gradient:
        "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600",
      neon: "text-blue-500 drop-shadow-[0_0_3px_rgba(59,130,246,0.8)]",
      modern: "text-blue-700",
      cyberpunk: "text-blue-500 border-2 border-blue-500 p-1 rounded-md",
    },
    Manajer: {
      gradient:
        "text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600",
      neon: "text-fuchsia-500 drop-shadow-[0_0_3px_rgba(217,70,239,0.8)]",
      modern: "text-fuchsia-700",
      cyberpunk: "text-fuchsia-500 border-2 border-fuchsia-500 p-1 rounded-md",
    },
    Kasir: {
      gradient:
        "text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600",
      neon: "text-emerald-500 drop-shadow-[0_0_3px_rgba(16,185,129,0.8)]",
      modern: "text-emerald-700",
      cyberpunk: "text-emerald-500 border-2 border-emerald-500 p-1 rounded-md",
    },
    Default: {
      gradient:
        "text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-gray-600",
      neon: "text-gray-500 drop-shadow-[0_0_3px_rgba(107,114,128,0.8)]",
      modern: "text-gray-700",
      cyberpunk: "text-gray-500 border-2 border-gray-500 p-1 rounded-md",
    },
  };

  const style =
    colorStyles[role]?.[styleType] || colorStyles.Default[styleType];

  return (
    <div className={`inline-flex items-center justify-center mr-4 ${style}`}>
      <Icon size={size} />
    </div>
  );
};

const Sidebar = ({
  numericRole,
  idCompany,
  idStore,
  setSelectedLink,
  selectedLink,
}) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  // Map numericRole to userRole directly from props
  const roleMapping = {
    1: "superadmin",
    2: "admin",
    3: "manajer",
    4: "kasir",
    5: "customer",
    null: "guest",
  };
  const userRole = roleMapping[numericRole] || "guest";

  const toggleMenu = (menuKey) =>
    setExpandedMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));

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
    { label: "Jabatan", icon: <TbUserSquare />, key: "rule" },
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
          return false; // Remove items requiring idStore if it's null
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
  }, [idCompany, idStore, userRole]);

  const role = userRole.charAt(0).toUpperCase() + userRole.slice(1);

  const roleMenuStyleMapping = {
    Superadmin:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b-4 border-indigo-900 shadow-lg rounded-xl",
    Admin:
      "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-b-4 border-blue-900 shadow-lg rounded-xl",
    Manajer:
      "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-b-4 border-violet-900 shadow-lg rounded-xl",
    Kasir:
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-b-4 border-emerald-900 shadow-lg rounded-xl",
    Default:
      "bg-gradient-to-r from-slate-600 to-gray-600 text-white border-b-4 border-slate-900 shadow-lg rounded-xl",
  };

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
          filteredMenuConfig={filteredMenuConfig}
        />
      </motion.div>
      <motion.div
        className="drawer-side relative z-20"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div
          className={`top-20 menu w-80 pl-4 py-2 border-b-4 border-black fixed z-50 bg-white shadow-lg rounded-xl ${roleMenuStyleMapping[role]}`}
        >
          <span className="flex items-center text-2xl font-bold">
            <FuturisticRoleIcon
              role={role}
              iconSet="fa"
              size={32}
              styleType="neon"
            />
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
