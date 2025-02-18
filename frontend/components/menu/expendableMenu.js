import React from "react";

const ExpandableMenu = ({
  label,
  icon: Icon,
  menuKey,
  expandedMenus,
  toggleMenu,
  isActive,
  children,
}) => {
  return (
    <>
      {/* Parent Menu */}
      <div
        className={`rounded-xl flex items-center justify-between px-4 py-2 mb-[-5vh] cursor-pointer ${
          isActive
            ? "bg-slate-500 text-neutral-800 hover:bg-slate-500"
            : "hover:bg-gray-100"
        }`}
        onClick={() => toggleMenu(menuKey)}
      >
        {/* Label */}
        <span>{label}</span>
        {/* Icon */}
        {Icon && (
          <Icon
            className={`transition-transform duration-200 w-7 h-7 ${
              expandedMenus[menuKey] ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
      {/* Children */}
      <li className="ps-3 mt-[5vh]">{expandedMenus[menuKey] && children}</li>
    </>
  );
};

export default ExpandableMenu;
