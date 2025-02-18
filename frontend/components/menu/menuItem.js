import React from "react";

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
      {icon && React.cloneElement(icon, { className: "mr-2" })}
      {label}
    </a>
  );
};

export default MenuItem;
