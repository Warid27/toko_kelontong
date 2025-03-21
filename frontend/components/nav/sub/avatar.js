import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { TbChevronDown } from "react-icons/tb";
import { getAvatar } from "@/libs/fetching/user";
import CompanySelector from "@/components/nav/sub/companySelector";
import StoreSelector from "@/components/nav/sub/storeSelector";

const Avatar = ({
  selector,
  handleLogout,
  setSelectedLink,
  userData,
  updateLocalStorage,
}) => {
  const [avatar, setAvatar] = useState(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      const avatarUrl = await getAvatar(userData.id);
      setAvatar(avatarUrl);
    };
    fetchAvatar();
  }, [userData.id]);

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
        <Image
          src={avatar || "/User-avatar.png"}
          alt="User Avatar"
          layout="fill"
          objectFit="cover"
          className="rounded-full"
        />
      </div>

      {/* Dropdown Toggle Button */}
      <button
        className="flex items-center justify-center p-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition duration-200 shadow-sm"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <TbChevronDown
          className={`text-2xl text-gray-700 transition-transform duration-300 ${
            dropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-16 w-56 bg-white shadow-2xl rounded-xl  z-20 backdrop-blur-md transition-all duration-300 ease-out transform ${
          dropdownOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-[-10px] pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent closing on inside clicks
      >
        <ul className="divide-y divide-gray-200">
          <li>
            <button
              onClick={handleNavigateToProfile}
              className="block w-full px-6 py-3 text-left text-gray-800 hover:bg-gray-100 transition-all duration-200"
            >
              Profile
            </button>
          </li>
          {selector === "superadmin" ? (
            <li>
              <CompanySelector updateLocalStorage={updateLocalStorage} />
            </li>
          ) : selector === "admin" ? (
            <li>
              <StoreSelector
                updateLocalStorage={updateLocalStorage}
                companyId={userData.id_company}
              />
            </li>
          ) : null}
          <li>
            <button
              onClick={handleLogout}
              className="block w-full px-6 py-3 text-left text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Avatar;
