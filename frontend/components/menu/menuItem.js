import React from "react";
import { motion } from "framer-motion";

const MenuItem = ({ icon, label, onClick, isActive }) => {
  return (
    <motion.a
      onClick={onClick}
      className="flex items-center py-2 px-4 cursor-pointer"
      animate={{
        backgroundColor: isActive ? "#2A323C" : "transparent",
      }}
      whileHover={{
        backgroundColor: isActive ? "#2A323C" : "#6B7280",
        color: "#D1D5DB",
      }}
    >
      <motion.div
        key={label}
        className="w-full"
        whileHover={{ scale: 1.01, color: "#D1D5DB" }}
        whileTap={{ scale: 0.99 }}
        animate={{ color: isActive ? "#D1D5DB" : "inherit" }}
      >
        <motion.div className="w-full flex items-center">
          {icon && React.cloneElement(icon, { className: "mr-2" })}
          {label}
        </motion.div>
      </motion.div>
    </motion.a>
  );
};

export default MenuItem;
