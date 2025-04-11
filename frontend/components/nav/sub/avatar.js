import React, { useEffect, useState, useRef } from "react";
import { TbChevronDown } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import CompanySelector from "@/components/nav/sub/companySelector";
import StoreSelector from "@/components/nav/sub/storeSelector";
import ImageWithFallback from "@/utils/ImageWithFallback";
import useUserStore from "@/stores/user-store";

const Avatar = () => {
  const { logout, setSelectedLink, userData } = useUserStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatar = userData.avatar;

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleNavigateToProfile = () => {
    setDropdownOpen(false);
    setSelectedLink("profile");
  };

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Avatar */}
      <div className="relative w-14 h-14 rounded-full border-[3px] border-white overflow-hidden shadow-lg">
        <ImageWithFallback
          src={avatar || "/User-avatar.png"}
          alt="User Avatar"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
          onError={"https://placehold.co/100x100"}
        />
      </div>

      {/* Dropdown Toggle Button */}
      <motion.button
        className="flex items-center justify-center p-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition duration-200 shadow-sm"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        whileTap={{ scale: 0.95 }} // Add tap animation
      >
        <motion.span
          initial={false} // Prevent resetting animation on re-render
          animate={{ rotate: dropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <TbChevronDown className="text-2xl text-gray-700" />
        </motion.span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className="absolute right-0 top-16 w-56 bg-white shadow-2xl rounded-xl z-20 backdrop-blur-md"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()} // Prevent closing on inside clicks
          >
            <ul className="divide-y divide-gray-200">
              <li>
                <button
                  onClick={handleNavigateToProfile}
                  className="block w-full px-6 py-3 text-left rounded-t-xl text-gray-800 hover:bg-gray-100 transition-all duration-200"
                >
                  Profile
                </button>
              </li>
              {userData?.rule === 1 ? (
                <li>
                  <CompanySelector />
                </li>
              ) : userData?.rule === 2 ? (
                <li>
                  <StoreSelector />
                </li>
              ) : null}
              <li>
                <button
                  onClick={logout}
                  className="block rounded-b-xl w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  Logout
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Avatar;
