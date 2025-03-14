import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const SelectCostom = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        className="w-full bg-gradient-to-r from-green-600 to-green-400 text-white font-semibold p-3 rounded-lg shadow-sm border border-green-300 backdrop-blur-md focus:ring-2 focus:ring-green-300 transition-all duration-300 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {options.find((opt) => opt.value === value)?.label || "Pilih Status"}
        <FaChevronDown className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <motion.ul
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 mt-2 w-full bg-black/80 backdrop-blur-md border border-black rounded-lg shadow-sm overflow-hidden z-50"
        >
          {options.map((option) => (
            <li
              key={option.value}
              className="px-4 py-3 text-white hover:bg-green-500 transition-all cursor-pointer"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default SelectCostom
