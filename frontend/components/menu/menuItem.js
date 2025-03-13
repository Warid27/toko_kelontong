import React from "react";
import { motion } from "framer-motion";

const MenuItem = ({ icon, label, onClick, isActive }) => {
  return (
    <a
      onClick={onClick}
      className={`flex items-center py-2 px-4 cursor-pointer ${
        isActive
          ? "bg-[#2A323C] text-neutral-300 hover:bg-[#2A323C]"
          : "hover:bg-gray-500"
      }`}
    >
      <motion.div
        key={label}
        className="w-full"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div className="w-full flex items-center">
          {icon && React.cloneElement(icon, { className: "mr-2" })}
          {label}
        </motion.div>
      </motion.div>
    </a>
  );
};

export default MenuItem;
