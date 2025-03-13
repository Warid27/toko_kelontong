import React, { useRef } from "react";
import {motion} from "framer-motion"

const ExpandableMenu = ({
  label,
  icon: Icon,
  menuKey,
  expandedMenus,
  toggleMenu,
  isActive,
  children,
}) => {
  const contentRef = useRef(null);

  return (
    <>
      {/* Parent Menu */}


        <motion.div
          key={label}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`rounded-xl flex items-center justify-between px-4 py-2 cursor-pointer ${
            isActive
              ? "bg-slate-500 text-neutral-800 hover:bg-slate-500"
              : "hover:bg-gray-100"
          }`}
          onClick={() => toggleMenu(menuKey)}
        >
        <span>{label}</span>
        {Icon && (
          <Icon
            className={`transition-transform duration-300 w-7 h-7 ${
              expandedMenus[menuKey] ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
        </motion.div>

      {/* Children */}
      <div
        ref={contentRef}
        className="transition-all duration-500 overflow-hidden"
        style={{
          maxHeight: expandedMenus[menuKey]
            ? `${contentRef.current?.scrollHeight}px`
            : "0px",
          opacity: expandedMenus[menuKey] ? 1 : 0,
        }}
      >
        <div className="flex flex-col gap-1 ps-3 py-2">{children}</div>
      </div>
    </>
  );
};

export default ExpandableMenu;
