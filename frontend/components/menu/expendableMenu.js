import React from "react";

const ExpandableMenu = ({
  label,
  icon: Icon,
  menuKey,
  expandedMenus,
  toggleMenu,
  children,
}) => {
  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer my-[-0.5rem]"
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
      <li className="ps-3">{expandedMenus[menuKey] && children}</li>
    </>
  );
};

export default ExpandableMenu;
