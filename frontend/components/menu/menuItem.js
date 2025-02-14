import React from "react";

const MenuItem = ({ icon, label, onClick }) => {
  return (
    <a
      onClick={onClick}
      className="flex items-center py-2 px-4 hover:bg-gray-100 cursor-pointer"
    >
      {icon && React.cloneElement(icon, { className: "mr-2" })}
      {label}
    </a>
  );
};

export default MenuItem;
